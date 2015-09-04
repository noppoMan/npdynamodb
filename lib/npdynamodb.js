'use strict';

var QueryBuilder = require('./query_builder');
var promisify = require('./promisify');
var DOC = require("dynamodb-doc");

var promisifiedPool = {};

function npdynamodb(clients, options){
  var qb = new QueryBuilder(clients, options);
  return qb;
}

module.exports = function(dynamodb, options){
  var v = dynamodb.config.apiVersion,
    api = require('./dialects/' + v + '/' + 'api')
  ;

  if(!promisifiedPool[v]) {
    promisifiedPool[v] = promisify(dynamodb, api.originalApis);
  }

  var clients = {
    dynamodb: typeof dynamodb.Condition === 'function' ? dynamodb: new DOC.DynamoDB(dynamodb),
    promisifidRawClient: promisifiedPool[v]
  };

  return function(){
    return npdynamodb(clients, options);
  };
};
