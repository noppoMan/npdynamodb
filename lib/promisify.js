'use strict';

var Promise = require('bluebird');

module.exports = function(lib, apis){
  var promisifiedMethods = {};

  apis.forEach(function(m){
    promisifiedMethods[m] = Promise.promisify(lib[m], lib);
  });

  return promisifiedMethods;
};
