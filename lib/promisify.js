'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function(lib, apis){
  var promisifiedMethods = {};

  apis.forEach(function(m){
    promisifiedMethods[m] = function(){
      var args = _.toArray(arguments);
      return new Promise(function(resolve, reject){
        args.push(function(err, data){
          if(err) {
            return reject(err);
          }
          resolve(data);
        });
        lib[m].apply(lib, args);
      });
    };
  });

  return promisifiedMethods;
};
