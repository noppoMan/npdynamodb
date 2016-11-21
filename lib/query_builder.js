'use strict';

var interfaces = require('./interface');
var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var utils = require('./utils');

var Features = {
  '2012-08-10': require('./dialects/2012-08-10/feature')
};

module.exports = QueryBuilder;

function QueryBuilder(clients, options){
  EventEmitter.call(this);
  var feature = new Features[clients.dynamodb.config.apiVersion](clients);

  var opts = options || {};
  var initialize = opts.initialize;

  this.apiVersion = feature.client.config.apiVersion;
  this._feature = feature;
  this._options = _.omit(opts, 'initialize');
  this._initializer = opts.initialize;
  this._callbacks = {};

  if(typeof this._initializer === 'function') {
    this._initializer.bind(this)();
  }
}
util.inherits(QueryBuilder, EventEmitter);

interfaces.forEach(function(m){
  QueryBuilder.prototype[m] = function(){
    this._feature[m].apply(this._feature, _.toArray(arguments));
    return this;
  };
});

QueryBuilder.prototype.freshBuilder = function(){
  return new QueryBuilder({
      dynamodb: this._feature.client,
      promisifidRawClient: this._feature.promisifidRawClient
    },
    _.clone(_.extend(this._options, {initialize: this._initializer}))
  );
};

QueryBuilder.prototype.tableName = function(){
  return this._feature.conditions.TableName;
};

QueryBuilder.prototype.normalizationRawResponse = function(data){
  return this._feature.normalizationRawResponse(data);
};

QueryBuilder.prototype.feature = function(cb){
  cb(this._feature);
  return this;
};

QueryBuilder.prototype.rawClient = function(cb){
  return this._feature.promisifidRawClient;
};

QueryBuilder.prototype.callbacks = function(name, fn){
  if(!this._callbacks[name]){
    this._callbacks[name] = [];
  }
  this._callbacks[name].push(fn);
  return this;
};

function callbacksPromisified(callbacks, data){
  return (callbacks || []).map(function(f){
    return f.bind(this)(data);
  }.bind(this));
}

_.each([
  'then',
], function(promiseInterface){
  QueryBuilder.prototype[promiseInterface] = function(cb){
    var self = this;
    var feature = self._feature;
    var callbacks = this._callbacks;
    var timer;

    return Promise.all(callbacksPromisified.bind(self)(callbacks.beforeQuery)).then(function(){
      var built = feature.buildQuery();
      self.emit('beforeQuery', built.params);

      return new Promise(function(resolve, reject){
        var request = feature.client[built.method](built.params, function(err, data){
          if(timer) {
            clearTimeout(timer);
            timer = null;
          }
          if(err) {
            return reject(err);
          }
          resolve(data);
        });

        // Handle timeout
        if(self._options.timeout !== null) {
          timer = setTimeout(function(){
            request.abort();
            reject(new Error("The connection has timed out."));
          }, self._options.timeout || 5000);
        }
      });
    })
    .then(function(data){
      return Promise.all(callbacksPromisified.bind(self)(callbacks.afterQuery, data)).then(function(){
        self.emit('afterQuery', data);
        return data;
      });
    })
    .then(function(data){
      return cb.bind(self)(data);
    });
  };
});
