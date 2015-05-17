'use strict';

var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var DOC = require("dynamodb-doc");

var promisify = require('../../promisify');
var transformer = require('./transformer');
var utils = require('../../utils');

var operators;
var dynamoApiJsonPath = 'aws-sdk/apis/dynamodb-2012-08-10.min.json';

try {
  operators = require(dynamoApiJsonPath).operations;
} catch(e) {
  var fs = require('fs');
  var pathFromWorkingDir = process.cwd() + "/node_modules/" + dynamoApiJsonPath;
  if(fs.existsSync(pathFromWorkingDir)){
    operators = require(pathFromWorkingDir).operations;
  }else{
    throw new TypeError("Module `aws-sdk` is required for npdynamodb");
  }
}

var originalApis = _.keys(operators).map(function(api){
  return _.camelCase(api);
});

var docClient,
  promisifiedDocClient,
  rawClient,
  promisifidRawClient
;

var extraOperators = {
  where: [
    'BEGINS_WITH',
    'BETWEEN'
  ],
  filter: [
    'BETWEEN',
    'BEGINS_WITH',
    'NOT_NULL',
    'NULL',
    'CONTAINS',
    'NOT_CONTAINS',
    'IN'
  ]
};

var availableOperators = transformer.availableOperators.concat(extraOperators.filter);

var parameterBuilder = {};

parameterBuilder.createTable = parameterBuilder.deleteTable = function(feature){
  return { conditions: feature.params };
};

parameterBuilder.deleteItem = parameterBuilder.getItem = parameterBuilder.updateItem = function(feature){
  var cond = utils.collectionFlatten(_.map(feature.whereConditions, function(param){
    return utils.newObject(param.key, param.values[0]);
  }));

  return { conditions: { Key: cond } };
};

parameterBuilder.query = function(feature){
  var obj = {};

  obj.KeyConditions = toDocClientConditon(feature.whereConditions);

  if(!_.isEmpty(feature.filterConditions)){
    obj.QueryFilter = toDocClientConditon(feature.filterConditions);
  }

  return { conditions: obj };
};

parameterBuilder.putItem = function(feature){
  if(_.isArray(feature.params)) {
    var items = feature.params.map(function(item){
      return {PutRequest: { Item: item } };
    });

    var tableName = feature.conditions.TableName;

    return {
      beforeQuery: function(){
        this.nonTable();
      },
      nextThen: 'batchWriteItem',
      conditions: {
        RequestItems: utils.newObject(tableName, items)
      }
    };

  }else{
    return {conditions: { Item: feature.params } };
  }
};

function Feature(dynamodb){
  EventEmitter.call(this);

  docClient = docClient || new DOC.DynamoDB(dynamodb);
  promisifiedDocClient = promisifiedDocClient || promisify(docClient, originalApis);

  promisifidRawClient = promisifidRawClient || promisify(dynamodb, originalApis);

  this.rawClient = promisifidRawClient;

  this.client = promisifiedDocClient;

  this.nextThen = undefined;

  this.params = {};

  this.whereConditions = [];

  this.filterConditions = [];

  this.conditions = {};

  this.schema = {};
}

util.inherits(Feature, EventEmitter);

_.each(operators, function(spec, method){
  _.each(spec.input.members, function(typeSpec, member){
    Feature.prototype[_.camelCase(member)] = function(params){
      this.conditions[member] = params;
      return this;
    };
  });
});

_.each(transformer.transformFunctionMap, function(oldM, newM){
  Feature.prototype[newM] = function(params){
    this.nextThen = oldM;
    this.params = params;
  };
});

Feature.prototype.select = function(){
  this.attributesToGet(utils.formatArguments(arguments));
};

Feature.prototype.table = function(tableName){
  this.tableName(tableName);
};

Feature.prototype.count = function(){
  this.conditions.Select = 'COUNT';
  this.nextThen = 'query';
};

_.each([
  'filter',
  'where'
], function(operator){

  Feature.prototype[operator] = function(){
    addConditions.apply(this, [operator].concat(utils.formatArguments(arguments)));
    return this;
  };

  _.each(extraOperators[operator], function(_operator){
    Feature.prototype[operator + utils.toPascalCase(_operator.toLowerCase())] = function(){
      var args = utils.formatArguments(arguments);
      var newArgs = [operator, args.shift(), _operator].concat(args);
      addConditions.apply(this, newArgs);
      return this;
    };
  });
});

function addConditions(){
  var args = utils.formatArguments(arguments);
  var col = args[1], op = args[2], val = args[3];
  if(!_.contains(availableOperators, op)){
    val = op;
    op = '=';
  }

  this[args[0]+'Conditions'].push({
    key: col,
    values: [val].concat(Array.prototype.slice.call(args, 4)),
    operator: op
  });
}

Feature.prototype.set = function(key, action, value){
  if(!this.conditions.AttributeUpdates) {
    this.conditions.AttributeUpdates = {};
  }

  this.conditions.AttributeUpdates[key] = {
    Action: action,
    Value: value
  };

  return this;
};

Feature.prototype.asc = function(){
  this.scanIndexForward(true);
};

Feature.prototype.desc = function(){
  this.scanIndexForward(false);
};

Feature.prototype._buildQuery = function(){
  var nextThen = this.nextThen || 'query';
  var self = this;

  function supplement(builder){
    if(!builder) return undefined;

    return function(){
      var result = builder(self);
      if(!result.beforeQuery) result.beforeQuery = function(){};
      if(!result.nextThen) result.nextThen = nextThen;

      return result;
    };
  }

  var builder = supplement(parameterBuilder[nextThen]) || function(){
    return {
      beforeQuery: function(){},
      conditions: {},
      nextThen: nextThen
    };
  };

  var built = builder();
  built.beforeQuery.call(this);

  this.nextThen = built.nextThen;
  this.conditions = _.extend(this.conditions, built.conditions);

  return {
    params: this.conditions,
    runner: this.client[this.nextThen]
  };
};

function toDocClientConditon(conditions){
  return conditions.map(function(cond){
    var args = [
      cond.key,
      transformer.transformOperatorMap[cond.operator] || cond.operator
    ].concat(cond.values);
    return docClient.Condition.apply(docClient, args);
  });
}

Feature.prototype.nonTable = function(builder){
  this.conditions = _.omit(this.conditions, 'TableName');
};

Feature.prototype.run = function(promiseInterface, cb){
  var self = this;
  var built = this._buildQuery();

  self.emit('beforeQuery', built.params);

  var promise = built.runner(built.params);

  return promise[promiseInterface](function(data){
    self.emit('afterQuery', data);
    return cb(data);
  });
};


module.exports = Feature;
