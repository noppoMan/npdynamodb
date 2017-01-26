'use strict';

var Promise = require('bluebird');

module.exports = function(lib, apis){
  var promisifiedMethods = {};

  apis.forEach(function(m){
    // TODO Need to support all apis
    if(!lib[m]) {
      return;
    }
    promisifiedMethods[m] = Promise.promisify(lib[m], lib);
  });

  return promisifiedMethods;
};
