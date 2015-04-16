var _ = require('lodash');

module.exports = {
  Collection: ResultItemCollection,

  Item: ResultItem
}

function ResultItemCollection(items){
  this._items = items.map(function(item){
    return new ResultItem(item);
  });
}

ResultItemCollection.prototype.length = function(){
  return this._items.length;
}

_.each([
  'each',
  'map',
  'reduce',
  'reduceRight',
  'find',
  'filter',
  'where',
  'findWhere',
  'reject',
  'every',
  'some',
  'contains',
  'invoke',
  'pluck',
  'max',
  'min',
  'sortBy',
  'groupBy',
  'indexBy',
  'countBy',
  'shuffle',
  'sample',
  'toArray',
  'size',
  'partition',
  'first',
  'last'
], function(name){
  ResultItemCollection.prototype[name] = function(){
    var args = [this._items].concat(_.map(arguments, function(arg){ return arg; }));
    return _[name].apply(_, args);
  };
});

function ResultItem(item){
  this._attributes = item;
}

ResultItem.prototype.get = function(key){
  return this._attributes[key];
}

ResultItem.prototype.attributes = function(){
  return this._attributes;
}
