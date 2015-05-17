'use strict';

var _ = require('lodash');
var Collection = require('./collection');
var promiseRunner = require('./promise_runner');
var npdynamodb = require('../npdynamodb');

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
    self._attributes = data.Item;
    return self;
  });
};

Model.prototype.fetch = function(){
  var self = this;

  return Runner.bind(this)(this._builder, function(data){
    var models = data.Items.map(function(item){
      var copiedModel = _.cloneDeep(self);
      copiedModel._attributes = item;
      copiedModel.__proto__ = Model.prototype;
      return copiedModel;
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
  //npdynamodb
  this._builder = npdynamodb(this.dynamodb).table(this.tableName);
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
