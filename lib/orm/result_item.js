'use strict';

var _ = require('lodash');

module.exports = ResultItem;

function ResultItem(item){
  this._attributes = item;
}

ResultItem.prototype.set = function(key, value){
  this._attributes[key] = value;
  return this;
};

ResultItem.prototype.get = function(key){
  return this._attributes[key];
};

ResultItem.prototype.isEmpty = function(){
  return _.isEmpty(this._attributes);
};

ResultItem.prototype.attributes = function(){
  return this._attributes;
};

ResultItem.prototype.toJson = function(){
  return JSON.stringify(this._attributes);
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
  ResultItem.prototype[name] = function(){
    var args = [this._item].concat(_.map(arguments, function(arg){ return arg; }));
    return _[name].apply(_, args);
  };
});
