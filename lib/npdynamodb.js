'use strict';

var QueryBuilder = require('./query_builder');

module.exports = function(dynamoClient){
  var apiVer = dynamoClient.config.apiVersion;
  var Feature = require('./dialects/'+ apiVer +'/feature');
  var qb = new QueryBuilder(new Feature(dynamoClient));
  return qb;
};
