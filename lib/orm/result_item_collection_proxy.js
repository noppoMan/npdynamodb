var _ = require('lodash');

module.exports = ResultItemCollectionProxy;

function ResultItemCollectionProxy(items){
  this._items = items;
  this._hashed = this.toHash();
}

ResultItemCollectionProxy.prototype.toHash = function(){
  return this._items.map(function(item){
    return item.attributes();
  })
}

ResultItemCollectionProxy.prototype.toJSON = function(){
  return JSON.stringify(this.toHash);
}

_.each([
  'pluck'
], function(name){
  ResultItemCollectionProxy.prototype[name] = function(){
    var args = [this._hashed].concat(_.map(arguments, function(arg){ return arg; }));
    return _[name].apply(_, args);
  };
});

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
  'invoke',
  'sortBy',
  'groupBy',
  'indexBy',
  'countBy',
  'shuffle',
  'sample',
  'size',
  'partition',
  'first',
  'last'
], function(name){
  ResultItemCollectionProxy.prototype[name] = function(){
    var args = [this._items].concat(_.map(arguments, function(arg){ return arg; }));
    return _[name].apply(_, args);
  };
});
