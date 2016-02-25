'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var SchemaBuilder = require('../schema/builder');
var utils = require('../utils');

var npdynamodb = require('../npdynamodb');

var migration_suffix = '.js'

function create(npd){
  return function(){
    return new Migrator(npd);
  };
}

function Migrator(npd){
  this.npd = npd;
}

Migrator.prototype.createTable = function(tableName, callback){
  var query = this.npd();
  var builder = new SchemaBuilder({
    apiVer: query.apiVersion,
    tableName: tableName
  });

  callback(builder);

  var params = builder.buildCreateTable();
  return query.table(tableName).createTable(params).then(function(){
    return this.waitForTableExists(tableName);
  }.bind(this));
};

Migrator.prototype.updateTable = function(tableName, callback) {
  var query = this.npd();
  var builder = new SchemaBuilder({
    apiVer: query.apiVersion,
    tableName: tableName,
    IndexType: SchemaBuilder.Schema.IndexType.GSIU,
    withoutDefaultTableInfo: true
  });

  callback(builder);

  var params = builder.buildUpdateTable();
  return query.table(tableName).rawClient().updateTable(params);
};

Migrator.prototype.deleteTable = function(tableName) {
  return this.npd().table(tableName).deleteTable().then(function(){
    return this.waitForTableNotExists(tableName);
  }.bind(this));
};

Migrator.prototype.waitUntilTableActivate = function(tableName){
  var self = this;
  return new Promise(function(resolve, reject){
    var timer = setInterval(function(){
      self.npd().table(tableName).describe().then(function(result){
        if(result.Table.TableStatus === 'ACTIVE'){
          clearInterval(timer);
          timer = null;
          resolve(result);
        }
      }).catch(function(){
        console.log('Resource in used.');
      });
    }, 1000);
  });
};

Migrator.prototype.waitForTableExists = function(tableName) {
  return this.npd().rawClient().waitFor('tableExists', {
    TableName: tableName
  });
};

Migrator.prototype.waitForTableNotExists = function(tableName) {
  return this.npd().rawClient().waitFor('tableNotExists', {
    TableName: tableName
  });
};

function MigrateRunner(config){
  this.config = config;
  var npd = npdynamodb(config.dynamoClient, config.options);
  this.npd = npd;
  this.migrator = create(npd);
}

MigrateRunner.prototype._createMigrateTableIfNotExits = function(){
  var self = this;
  var tableName = this.config.migrations.tableName;
  return this.npd().showTables()
  .then(function(tables){
    var isFound = _.find(tables.TableNames, function(t){ return t === tableName });
    if(isFound) { return; }

    return self.migrator().createTable(tableName, function(t){
      t.number('version').hashKey();
      t.provisionedThroughput.apply(t, self.config.migrations.ProvisionedThroughput);
    })
    .then(function(){
      return self.npd().rawClient().waitFor('tableExists', {TableName: tableName});
    });
  });
};

MigrateRunner.prototype.run = function(){
  var self = this;
  var tableName = this.config.migrations.tableName;

  return this._createMigrateTableIfNotExits().then(function(){
    return self.npd().table(tableName).all().then(function(data){
      var dirs = fs.readdirSync(self.config.cwd);

      var versions = _.sortBy(_.map(data.Items, function(data){
        return data.version;
      }));

      var incompletePaths = dirs.filter(function(dir){
        var version = dir.split('_')[0];
        if (version == parseInt(version)
            && dir.indexOf(migration_suffix, dir.length - migration_suffix.length) !== -1){
          if(!_.contains(versions, parseInt(version))) {
            return dir;
          }
        }
      });

      var tasks = incompletePaths.map(function(dir){
        var version = dir.split('_')[0];
        var migratorFile = require(self.config.cwd+'/'+dir);
        return utils.lazyPromiseRunner(function(){
          return migratorFile.up(self.migrator, self.config).then(function(){
            return self.npd().table(tableName).create({version: parseInt(version)});
          })
          .then(function(){
            return self.config.cwd+'/'+dir;
          });
        });
      });

      return utils.PromiseWaterfall(tasks);
    });
  });
};


MigrateRunner.prototype.rollback = function(){
  var self = this;
  var tableName = this.config.migrations.tableName;

  var pglob = Promise.promisify(glob);

  return this.npd().table(tableName).all().then(function(data){

    var versions = _.sortBy(_.map(data.Items, function(data){
      return data.version;
    })).reverse();

    var lastVersion = _.first(versions);
    if(!lastVersion) {
      return Promise.resolve(null);
    }

    return pglob(path.join(self.config.cwd, '/' + lastVersion + "_*.js")).then(function(maches){
      return new Promise(function(resolve, reject){
        return require(maches[0]).down(self.migrator, self.config).then(function(){
          return self.npd()
            .table(tableName)
            .where('version', lastVersion)
            .delete()
            .then(function(){
              resolve(maches[0]);
            });
        })
        .catch(reject);
      });
    });
  });
};


module.exports = {
  create: create,

  Runner: MigrateRunner,

  Migrator: Migrator
};
