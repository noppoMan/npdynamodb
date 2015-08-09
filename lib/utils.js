'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

exports.isEmpty = function(val){
  if(val === null) return true;
  if(val === '') return true;
  if(_.isArray(val) && val.length === 0) return true;
  if(_.isObject(val) && _.keys(val).length === 0) return true;
  return false;
};

exports.newObject = function(key, val){
  var o = {};
  o[key] = val;
  return o;
};

exports.toPascalCase = function(string){
  var camelized = string.replace(/_./g, function(str) {
    return str.charAt(1).toUpperCase();
  });

  return camelized.charAt(0).toUpperCase() + camelized.slice(1);
};

exports.collectionFlatten = function(collection){
  var newObj = {};
  _.each(collection, function(obj){
    _.extend(newObj, obj);
  });
  return newObj;
};

exports.PromiseWaterfall = function(promises){

  return new Promise(function(resolve, reject){
    var results = [];

    function watefallThen(promise){

      if(promise && typeof promise.then === 'function') {
        promise.then(function(data){
          results.push(data);
          watefallThen(promises.shift());
        }).catch(reject);
      } else if(promise && typeof promise.then !== 'function') {

        reject(new TypeError("Function return value should be a promise."));

      } else {
        resolve(results);
      }
    }

    watefallThen(promises.shift());
  });

};

exports.lazyPromiseRunner = function(cb) {
  return {
    then: function(callback){
      return cb().then(callback);
    }
  };
};

exports.pairEach = function(keys, values) {
  var obj = {};
  keys.forEach(function(key, i){
    obj[key] = values[i];
  });
  return obj;
};
