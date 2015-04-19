var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var DOC = require("dynamodb-doc");

var promisify = require('../../promisify');
var transformer = require('./transformer');
var utils = require('../../utils');

var operators = require('aws-sdk/apis/dynamodb-2012-08-10.min.json').operations;

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
}

var availableOperators = transformer.availableOperators.concat(extraOperators.filter);

module.exports = Feature;

function Feature(dynamodb){
  EventEmitter.call(this);

  if(!docClient) {
    docClient = new DOC.DynamoDB(dynamodb);
    promisifiedDocClient = promisify(docClient, originalApis);
  }

  if(!rawClient) {
    rawClient = dynamodb;
    promisifidRawClient = promisify(dynamodb, originalApis);
  }

  this.rawClient = promisifidRawClient;

  this.client = promisifiedDocClient;

  this.nextThen = 'query';

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
      return this.conditions[member] = params;
    }
  });
});

_.each(transformer.transformFunctionMap, function(oldM, newM){
  Feature.prototype[newM] = function(params){
    this.nextThen = oldM;
    this.params = params;
  }
});

Feature.prototype.select = function(){
  this.attributesToGet(utils.formatArguments(arguments));
}

Feature.prototype.table = function(tableName){
  this.tableName(tableName);
}

Feature.prototype.count = function(){
  this.conditions.Select = 'COUNT';
  this.nextThen = 'query';
}

_.each([
  'filter',
  'where'
], function(operator){

  Feature.prototype[operator] = function(){
    addConditions.apply(this, [operator].concat(utils.formatArguments(arguments)));
    return this;
  }

  _.each(extraOperators[operator], function(_operator){
    Feature.prototype[operator + utils.toPascalCase(_operator.toLowerCase())] = function(){
      var args = utils.formatArguments(arguments);
      var newArgs = [operator, args.shift(), _operator].concat(args);
      addConditions.apply(this, newArgs);
      return this;
    }
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


Feature.prototype.asc = function(){
  this.scanIndexForward(true);
}

Feature.prototype.desc = function(){
  this.scanIndexForward(false);
}

Feature.prototype.buildParams = function(){
  var availableConditions = {};

  switch(this.nextThen) {
    case 'createTable':
    case 'deleteTable':
      _.extend(this.conditions, _.clone(this.params));
      break;

    case 'deleteItem':
    case 'getItem':
      var cond = utils.collectionFlatten(_.map(this.whereConditions, function(param){
        return utils.newObject(param.key, param.values[0]);
      }));

      this.key(cond);
      break;

    case 'query':
      this.keyConditions(toDocClientConditon(this.whereConditions));

      if(!_.isEmpty(this.filterConditions)){
        this.queryFilter(toDocClientConditon(this.filterConditions));
      }

      break;

    case 'putItem':

      if(_.isArray(this.params)) {
        this.nextThen = 'batchWriteItem';
        var items = this.params.map(function(item){
          return {PutRequest: { Item: item } };
        });

        this.requestItems(utils.newObject(this.conditions.TableName, items));
        this.nonTable();

      }else{
        this.item(this.params);
      }

      break;
    default:
      break;
  }

  return this.conditions;
}

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
}

Feature.prototype.run = function(promiseInterface, cb){
  var self = this;
  var params = this.buildParams();
  var promiseFn = this.client[this.nextThen];

  self.emit('beforeQuery', params);

  return promiseFn(params)[promiseInterface](function(data){
    self.emit('afterQuery', data);
    return cb(data);
  });
}
