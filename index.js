'use strict';

var npdynamodb = require('./lib/npdynamodb');
var npdynamodbORM = require('./lib/orm/index');
var promisify = require('./lib/promisify');
var DOC = require("dynamodb-doc");

exports.version = require('./package.json').version;

exports.createClient = function(dynamodb, options){
  var api = require('./lib/dialects/' + dynamodb.config.apiVersion + '/' + 'api');
  var clients = {
    dynamodb: typeof dynamodb.Condition === 'function' ? dynamodb: new DOC.DynamoDB(dynamodb),
    promisifidRawClient: promisify(dynamodb, api.originalApis)
  };
  return function(){
    return npdynamodb(clients, options);
  };
};

exports.define = function(tableName, prototypeProps, staticProps){
  return npdynamodbORM(tableName, prototypeProps, staticProps);
};

exports.Collection = require('./lib/orm/collection');

exports.Model = require('./lib/orm/model');

exports.Migrator = require('./lib/migrate/migrator');
