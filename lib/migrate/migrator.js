var _ = require('lodash');
var npdynamodb = require('../../index');
var SchemaBuilder = require('../schema/builder');
var Promise = require('bluebird');
var path = require('path');
var glob = require('glob');
var fs = require('fs');

exports.create = function(dynamodb){
  return function(){
    return new Migrator(dynamodb);
  }
}

exports.Runner = MigrateRunner;

function Migrator(dynamodb){
  this.apiVer = dynamodb.config.apiVersion;
  this.npd = npdynamodb.createClient(dynamodb);
}

Migrator.prototype.createTable = function(tableName, callback){
  var builder = new SchemaBuilder({
    tableName: tableName
  });

  callback(builder);

  var params = require('../dialects/' + this.apiVer + "/schema").build(builder);
  return this.npd().table(tableName).createTable(params);
}

Migrator.prototype.deleteTable = function(tableName) {
  return this.npd().table(tableName).deleteTable();
}


function MigrateRunner(config){
  this.config = config;
  var npdynamodb = require('../../index');

  this.npd = npdynamodb.createClient(config.dynamoClient);
  this.migrator = exports.create(config.dynamoClient);
}

MigrateRunner.prototype._createMigrateTableIfNotExits = function(){
  var self = this;
  var tableName = this.config.migrations.tableName;
  return this.npd().showTables()
  .then(function(tables){
    var isFound = _.find(tables.TableNames, function(t){ return t === tableName });
    if(isFound) {
      return;
    }

    return self.migrator().createTable(tableName, function(t){
      t.number('version').hashKey();
      t.provisionedThroughput.apply(t, self.config.migrations.ProvisionedThroughput);
    });
  });
}

MigrateRunner.prototype.run = function(){
  var self = this;
  var tableName = this.config.migrations.tableName;

  return this._createMigrateTableIfNotExits()
  .then(function(){
    return self.npd().table(tableName).all()
    .then(function(data){

      var dirs = fs.readdirSync(self.config.cwd);

      var tasks = [];
      dirs.forEach(function(dir){
        var version = dir.split('_')[0];

        var isFound = _.find(data.Items, function(col){
          return col.version == version
        }) != undefined;

        if(!isFound) {
          var migratorFile = require(self.config.cwd+'/'+dir);

          tasks.push(
            new Promise(function(resolve, reject){
              migratorFile
              .up(self.migrator)
              .then(function(){
                return self.npd().table(tableName).save({version: parseInt(version)});
              })
              .then(function(){
                console.log('Migrated ' + self.config.cwd+'/'+dir);
                resolve();
              })
              .catch(reject);
            })
          );
        }
      });

      return Promise.all(tasks);
    })
  });
};


MigrateRunner.prototype.rollback = function(){
  var self = this;
  var tableName = this.config.migrations.tableName;

  var pglob = Promise.promisify(glob);

  return this.npd().table(tableName).all()
  .then(function(data){
    var lastVersion = _.first(data.Items).version;

    return pglob(path.join(self.config.cwd, '/' + lastVersion + "_*.js"))
    .then(function(maches){
      return new Promise(function(resolve, reject){
        return require(maches[0])
        .down(self.migrator)
        .then(function(){
          return self.npd()
            .table(tableName)
            .where('version', lastVersion)
            .delete()
            .then(function(){
              console.log('Rollbacked ' + maches[0]);
              resolve();
            });
        })
        .catch(reject);
      });
    });
  });
}
