'use strict';

var interfaces = require('./interface');
var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var utils = require('./utils');

module.exports = QueryBuilder;

function QueryBuilder(feature){
  EventEmitter.call(this);
  this._feature = feature;
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
  return this._feature.rawClient;
};

_.each([
  'then'
], function(promiseInterface){
  QueryBuilder.prototype[promiseInterface] = function(cb){
    return this._feature.run(promiseInterface, cb.bind(this));
  };
});
