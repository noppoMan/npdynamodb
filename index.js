'use strict';

var NPDynamoDB = require('./lib/npdynamodb');
var NPDynamoDBORM = require('./lib/orm/index');

exports.version = require('./package.json').version;

exports.createClient = function(dynamodb){
  return function(){
    return NPDynamoDB(dynamodb);
  };
};

exports.define = function(tableName, params, customProps){
  return NPDynamoDBORM(tableName, params, customProps);
}

exports.Migrator = require('./lib/migrate/migrator');
