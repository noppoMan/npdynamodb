var _ = require('lodash');

exports.formatArguments = function (arguments){
  return _.map(arguments, function(a){
    return a;
  });
}

exports.isEmpty = function(val){
  if(val === null) return true;
  if(val === '') return true;
  if(_.isArray(val) && val.length === 0) return true;
  if(_.isObject(val) && _.keys(val).length === 0) return true;
  return false;
}

exports.newObject = function(key, val){
  var o = {};
  o[key] = val;
  return o;
}

exports.toPascalCase = function(string){
  var camelized = string.replace(/_./g, function(str) {
    return str.charAt(1).toUpperCase();
  });

  return camelized.charAt(0).toUpperCase() + camelized.slice(1);
}
