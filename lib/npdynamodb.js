'use strict';

var QueryBuilder = require('./query_builder');

module.exports = function(clients, options){
  var Feature = require('./dialects/'+ clients.dynamodb.config.apiVersion +'/feature');
  var qb = new QueryBuilder(new Feature(clients), options);
  return qb;
};
