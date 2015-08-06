'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var SchemaBuilder = require('../schema/builder');
var utils = require('../utils');

var npdynamodb = require('../npdynamodb');

exports.create = function(npd){
  return function(){
    return new Migrator(npd);
  };
};

exports.Runner = MigrateRunner;

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

  var params = builder.build();
  return query.table(tableName).createTable(params);
};

Migrator.prototype.deleteTable = function(tableName) {
  return this.npd().table(tableName).deleteTable();
};


function MigrateRunner(config){
  this.config = config;
  var npd = npdynamodb(config.dynamoClient);
  this.npd = npd;
  this.migrator = exports.create(npd);
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
        if(!_.contains(versions, parseInt(version))) {
          return dir;
        }
      });

      var tasks = incompletePaths.map(function(dir){
        var version = dir.split('_')[0];
        var migratorFile = require(self.config.cwd+'/'+dir);
        return utils.lazyPromiseRunner(function(){
          return migratorFile.up(self.migrator, self.config).then(function(data){
            return self._waitForResourceIfNeeded(this);
          })
          .then(function(){
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

  return this.npd().table(tableName).all()
  .then(function(data){

    var versions = _.sortBy(_.map(data.Items, function(data){
      return data.version;
    })).reverse();

    var lastVersion = _.first(versions);

    return pglob(path.join(self.config.cwd, '/' + lastVersion + "_*.js"))
    .then(function(maches){
      return new Promise(function(resolve, reject){
        return require(maches[0]).down(self.migrator, self.config).then(function(){
          return self._waitForResourceIfNeeded(this);
        })
        .then(function(){
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

MigrateRunner.prototype._waitForResourceIfNeeded = function(prevNpd){
  var client = this.npd().rawClient(),
    options = {TableName: prevNpd._feature.conditions.TableName}
  ;

  if(prevNpd._feature.nextThen === 'createTable') {

    return client.waitFor('tableExists', options);

  } else if(prevNpd._feature.nextThen === 'deleteTable') {

    return client.waitFor('tableNotExists', options);
  }

  // else do not anyting.
};
