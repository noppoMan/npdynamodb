var NPDynamoDB = require('./lib/npdynamodb');
var Schema = require('./lib/schema/schema');
var NPDynamoDBORM = require('./lib/orm/index');

exports.version = '0.0.1';

exports.createClient = function(dynamodb){
  return function(){
    return NPDynamoDB(dynamodb);
  };
};

exports.define = function(tableName, params){
  return NPDynamoDBORM(tableName, params);
}

exports.Migrator = require('./lib/migrate/Migrator');
