'use strict';

var npdynamodb = require('./lib/npdynamodb');
var npdynamodbORM = require('./lib/orm/index');

exports.version = require('./package.json').version;

exports.createClient = function(dynamodb){
  return function(){
    return npdynamodb(dynamodb);
  };
};

exports.define = function(tableName, params, customProps){
  return npdynamodbORM(tableName, params, customProps);
};

exports.Migrator = require('./lib/migrate/migrator');
