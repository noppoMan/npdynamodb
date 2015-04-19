var NPDynamoDB = require('./lib/npdynamodb');
var NPDynamoDBORM = require('./lib/orm/index');

exports.version = require('./package.json').version;

exports.createClient = function(dynamodb){
  return function(){
    return NPDynamoDB(dynamodb);
  };
};

exports.define = function(tableName, params){
  return NPDynamoDBORM(tableName, params);
}

exports.Migrator = require('./lib/migrate/migrator');
