var interfaces = require('./interface');
var _ = require('lodash');
var Promise = require('bluebird');
var utils = require('./utils');

var schemaManager = require('./schema/schema').manager;
var SchemaNotDefinedException = require('./schema/schema').SchemaNotDefinedException;

module.exports = QueryBuilder;

function QueryBuilder(feature){
  this.feature = feature;
}

interfaces.forEach(function(m){
  QueryBuilder.prototype[m] = function(){
    this.feature[m].apply(this.feature, utils.formatArguments(arguments));
    return this;
  }
});

QueryBuilder.prototype.extraParam = function(cb){
  cb(this.feature);
  return this;
}

QueryBuilder.prototype.rawClient = function(cb){
  return this.feature.rawClient;
}

QueryBuilder.prototype.then = function(cb){
  var self = this;
  if(self.feature.TableName && !schemaManager.isAlreadyDefined(self.feature.TableName)){
    return new Promise(function(_, reject){
      reject(new SchemaNotDefinedException(self.TableName));
    });
  }

  return this.feature.callNextThen().then(cb);
};
