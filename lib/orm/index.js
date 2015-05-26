'use strict';

var _ = require('lodash');
var util = require('util');

var utils = require('../utils');
var npdynamodb = require('../npdynamodb');

var BaseModel = require('./model');

module.exports = function(tableName, prototypeProps, staticProps){

  var reservedProps = ['hashKey', 'rangeKey', 'dynamodb'];

  function Model(attributes){
    this.tableName = tableName;

    _.extend(this, _.pick.apply(null, [prototypeProps].concat(reservedProps)));

    this._attributes = attributes || {};

    this._builder = npdynamodb(this.dynamodb).table(tableName);
  }

  _.extend(Model.prototype, _.clone(BaseModel.prototype));

  _.each(_.omit.apply(null, [prototypeProps].concat(reservedProps)), function(val, name){
    if(val.hasOwnProperty('bind')) {
      Model.prototype[name] = function(){
        return val.bind(this, utils.formatArguments(arguments));
      };
    }else{
      Model.prototype[name] = val;
    }
  });

  _.each([
    'find',
    'where',
    'query',
    'fetch',
    'save'
  ], function(_interface){
    Model[_interface] = function(){
      var model = new Model();
      return model[_interface].apply(model, utils.formatArguments(arguments));
    };
  });

  _.each(staticProps, function(val, name){
    if(val.hasOwnProperty('bind')) {
      Model[name] = val.bind(Model);
    }else{
      Model[name] = val;
    }
  });

  Model.npdynamodb = function(){
    return npdynamodb(prototypeProps.dynamodb);
  };

  return Model;
};
