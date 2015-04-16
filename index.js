var NPDynamoDB = require('./lib/npdynamodb');
var Schema = require('./lib/schema/schema');

exports.version = '0.0.1';

exports.createClient = function(dynamodb){
  return function(){
    return NPDynamoDB(dynamodb);
  };
};

exports.define = function(tableName, params){
  exports.createClient();
}

exports.Migrator = require('./lib/migrate/Migrator');
