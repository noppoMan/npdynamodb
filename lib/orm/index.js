'use strict';

var _ = require('lodash');
var util = require('util');

var utils = require('../utils');
var NPDynamoDB = require('../npdynamodb');

var ResultItem = require('./result_item');
var ResultItemCollectionProxy = require('./result_item_collection_proxy');
var PromiseRunner = require('./promise_runner');

module.exports = function(tableName, params){
  var config = _.extend({}, params, {tableName: tableName});

  var ormProxy = {
    config: config,

    npdynamodb: function(){
      return NPDynamoDB(params.dynamodb);
    },

    new: function(){
      return new Orm({
        config: config
      });
    },
  }

  // TODO Need to improve performace(Abolish dynamic dispatch)
  _.each([
    'find',
    'where',
    'query',
    'fetch',
    'save',
  ], function(_interface){
    ormProxy[_interface] = function(){
      var orm = new Orm({
        config: config
      });
      return orm[_interface].apply(orm, utils.formatArguments(arguments));
    }
  });

  return ormProxy;
};

function Orm(proxy){

  this._attributes = {};

  _.extend(this, proxy);

  this.npdynamodb = function(){ return NPDynamoDB(proxy.config.dynamodb); };

  this._builder = this.npdynamodb().table(this.config.tableName);
}

util.inherits(Orm, ResultItem);

Orm.prototype.where = function(){
  this._builder.where.apply(this._builder, arguments);
  return this;
}

Orm.prototype.query = function(fn){
  if(typeof fn === 'function') {
    fn(this._builder);
    return this;
  }

  return this._builder;
}

Orm.prototype.find = function(hashKeyVal, rangeKeyVal){
  var self = this;
  var query = this._builder.where(this.config.hashKey, hashKeyVal);

  if(rangeKeyVal) {
    query.where(this.config.rangeKey, rangeKeyVal);
  }

  return PromiseRunner(query.first(), function(data){
    return new Orm({
      config: self.config,
      _attributes: data.Item
    });
  });
}

Orm.prototype.fetch = function(){
  var self = this;

  return PromiseRunner(this._builder, function(data){
    var attributes = data.Items.map(function(item){
      return new Orm({
        config: self.config,
        _attributes: item
      });
    });

    return new ResultItemCollectionProxy(attributes);
  });
}


Orm.prototype.save = function(item){
  var self = this;

  if(typeof item === 'object'){
    _.extend(this._attributes, item);
  }

  return PromiseRunner(this._builder.save(this.attributes()), function(data){
    return new Orm({
      config: self.config,
      _attributes: self.attributes()
    });
  });
}

Orm.prototype.destroy = function(item){

  var query = this._builder.where(this.config.hashKey, this.get(this.config.hashKey));

  if(this.config.rangeKey) {
    query.where(this.config.rangeKey, this.get(this.config.rangeKey));
  }

  return PromiseRunner(query.delete());
}
