'use strict';

module.exports = Chainable;

function Chainable(){
  this.attr = {
    keyType: null,
    optional: false
  };
}

Chainable.prototype.attributes = function(){
  return this.attr;
};

Chainable.prototype.hashKey = function(){
  this.attr.keyType = 'HASH';
};

Chainable.prototype.rangeKey = function(){
  this.attr.keyType = 'RANGE';
};

Chainable.prototype.optional = function(){
  this.attr.optional = true;
};
