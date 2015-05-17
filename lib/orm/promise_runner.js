'use strict';

var Promise = require('bluebird');

module.exports = function(promsie, formatter) {
  var self = this;
  return new Promise(function(resolve, reject){
    return promsie.then(function(data){
      if(!formatter) {
        formatter = function(data){ return data; };
      }
      return resolve(formatter(data));
    }).catch(reject);
  });
};
