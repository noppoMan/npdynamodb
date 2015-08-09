'use strict';

var _ = require('lodash');
var Collection = require('./collection');
var promiseRunner = require('./promise_runner');

module.exports = Model;

function Runner(query, formatter){
  var self = this;
  return promiseRunner(query, function(data){
    self._refreshBuilder();
    return formatter(data);
  })
  .bind(this);
}

function Model(){}

Model.prototype.where = function(){
  this._builder.where.apply(this._builder, arguments);
  return this;
};

Model.prototype.query = function(fn){
  if(typeof fn === 'function') {
    fn(this._builder);
    return this;
  }

  return this._builder;
};

Model.prototype.find = function(hashKeyVal, rangeKeyVal){
  var self = this;
  var query = this._builder.where(this.hashKey, hashKeyVal);

  if(rangeKeyVal) {
    query.where(this.rangeKey, rangeKeyVal);
  }

  return Runner.bind(this)(query.first(), function(data){
    self._attributes = self._builder.normalizationRawResponse(data);
    return self;
  });
};

Model.prototype.reload = function(){
  return this.find(this.get(this.hashKey), this.get(this.rangeKey));
};

Model.prototype.fetch = function(){
  var self = this;

  return Runner.bind(this)(this._builder, function(data){
    var items = self._builder.normalizationRawResponse(data);
    var models = items.map(function(item){
      return new self.constructor(item);
    });

    return new Collection(models);
  });
};

Model.prototype.save = function(item){
  var self = this;

  if(typeof item === 'object'){
    _.extend(this._attributes, item);
  }

  return Runner.bind(this)(this._builder.create(this.attributes()), function(){
    return self;
  });
};

Model.prototype.destroy = function(item){
  var self = this;

  var query = this._builder.where(this.hashKey, this.get(this.hashKey));

  if(this.rangeKey) {
    query.where(this.rangeKey, this.get(this.rangeKey));
  }

  return Runner.bind(this)(query.delete(), function(){
    self._attributes = {};
    return self;
  });
};

Model.prototype.set = function(key, value){
  this._attributes[key] = value;
  return this;
};

Model.prototype.unset = function(key){
  if(this._attributes[key]) {
    delete this._attributes[key];
  }
  return this;
};

Model.prototype.extend = function(attributes){
  _.extend(this._attributes, attributes);
  return this;
};

Model.prototype.get = function(key){
  return this._attributes[key];
};

Model.prototype.isEmpty = function(){
  return _.isEmpty(this._attributes);
};

Model.prototype.attributes = function(){
  return this._attributes;
};

Model.prototype.toJson = function(){
  return JSON.stringify(this._attributes);
};

Model.prototype._refreshBuilder = function(){
  this._builder = this.npdynamodb().table(this.tableName);
};

_.each([
  'each',
  'map',
  'includes',
  'contains',
  'keys',
  'pick',
  'values',
], function(name){
  Model.prototype[name] = function(){
    var args = [this._item].concat(_.map(arguments, function(arg){ return arg; }));
    return _[name].apply(_, args);
  };
});
