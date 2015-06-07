'use strict';

var interfaces = require('./interface');
var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var utils = require('./utils');

module.exports = QueryBuilder;

function QueryBuilder(feature, options){
  EventEmitter.call(this);
  this._feature = feature;
  this._options = options || {};
  var self = this;

  _.each(['beforeQuery', 'afterQuery'], function(event){
    self._feature.on(event, function(data){
      self.emit(event, data);
    });
  });
}
util.inherits(QueryBuilder, EventEmitter);

interfaces.forEach(function(m){
  QueryBuilder.prototype[m] = function(){
    this._feature[m].apply(this._feature, utils.formatArguments(arguments));
    return this;
  };
});

QueryBuilder.prototype.tableName = function(){
  return this._feature.conditions.TableName;
};

QueryBuilder.prototype.feature = function(cb){
  cb(this._feature);
  return this;
};

QueryBuilder.prototype.rawClient = function(cb){
  return this._feature.promisifidRawClient;
};

_.each([
  'then',
], function(promiseInterface){
  QueryBuilder.prototype[promiseInterface] = function(cb){
    var self = this;
    var gotResponse = false;
    return new Promise(function(resolve, reject){
      var request = self._feature.run(function(err, data){
        gotResponse = true;
        if(err) {
          return reject(err);
        }
        resolve(data);
      });

      if(self._options.timeout !== null) {
        setTimeout(function(){
          if(!gotResponse) {
            request.abort();
            reject(new Error("The connection has timed out."));
          }
        }, self._options.timeout || 5000);
      }
    })
    .then(function(data){
      return cb.bind(self)(data);
    });
  };
});
