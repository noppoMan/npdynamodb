var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var DOC = require("dynamodb-doc");

var promisify = require('../../promisify');
var transformer = require('./transformer');
var utils = require('../../utils');

var operators = require('aws-sdk/apis/dynamodb-2012-08-10.min.json').operations;

var originalApis = _.keys(operators).map(function(api){
  return api.charAt(0).toLowerCase() + api.slice(1);
});

var docClient, promisifiedDocClient, rawClient, promisifidRawClient;

var extraWhereOperators = [
  'BEGINS_WITH',
  'BETWEEN'
];

var extraFilterOperators = [
  'NOT_NULL',
  'NULL',
  'CONTAINS',
  'NOT_CONTAINS',
  'IN'
]

var availableWhereOperators = transformer.availableOperators.concat(extraWhereOperators);
var availableFilterOperators = transformer.availableOperators.concat(extraWhereOperators).concat(extraFilterOperators);

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

  this.callbacks = {
    beforeQueryBuild: 'callbacks.beforeQueryBuild',
    beforeQuery: 'callbacks.beforeQuery',
    afterQuery: 'callbacks.afterQuery',
  }

  this.params = {};

  this.whereConditions = [];

  this.conditions = {};

  this.schema = {};
}

util.inherits(Feature, EventEmitter);

_.each(operators, function(spec, method){
  _.each(spec.input.members, function(typeSpec, member){
    Feature.prototype[member.charAt(0).toLowerCase() + member.slice(1)] = function(params){
      return this.conditions[member] = params;
    }
  });
});

_.map(transformer.transformFunctionMap, function(oldM, newM){
  Feature.prototype[newM] = function(params){
    this.nextThen = oldM;
    this.params = params;
  }
});

Feature.prototype.select = function(){
  this.attributesToGet.apply(this, utils.formatArguments(arguments));
}

Feature.prototype.table = function(tableName){
  this.tableName(tableName);
}

Feature.prototype.count = function(){
  this.conditions.Select = 'COUNT';
  this.nextThen = 'query';
}

_.each(extraWhereOperators, function(operator){
  Feature.prototype['where' + utils.toPascalCase(operator.toLowerCase())] = function(){
    var args = utils.formatArguments(arguments);
    var newArgs = [args.shift(), operator].concat(args);
    callWehere.apply(this, newArgs);
    return this;
  }
});


Feature.prototype.where = function(){
  callWehere.apply(this, utils.formatArguments(arguments));
  return this;
}

function callWehere(){
  var args = utils.formatArguments(arguments);
  var col = args[0], op = args[1], val = args[2];
  if(!_.contains(availableWhereOperators, arguments[1])){
    val = op;
    op = '=';
  }

  this.whereConditions.push({
    key: col,
    values: [val].concat(Array.prototype.slice.call(args, 3)),
    operator: op
  });
}


Feature.prototype.descending = function(){
  this.scanIndexForward(true);
}

Feature.prototype.toBuilder = function(){
  var availableConditions = {};

  this.emit(this.callbacks.beforeQueryBuild);

  switch(this.nextThen) {
    case 'deleteItem':
      var cond = {};
      _.each(this.whereConditions, function(param){
        var key = utils.newObject(param.key, param.values[0]);
        _.extend(cond, key);
      });
      this.key(cond);
      break;

    case 'getItem':
      // this.key({
      //
      // });
      break;

    case 'query':
      var cond = this.whereConditions.map(function(cond){

        var args = [
          cond.key,
          transformer.transformOperatorMap[cond.operator] || cond.operator
        ].concat(cond.values);

        return docClient.Condition.apply(docClient, args);
      });

      this.keyConditions(cond);
      break;

    case 'putItem':
      this.item(this.params);
      break;

    case 'batchWriteItem':
      var items = this.params.map(function(item){
        return {
          PutRequest: {
            Item: item
          }
        };
      });

      this.requestItems(utils.newObject(this.conditions.TableName, items));
      this.nonTable();
      break;
    default:
      break;
  }

  return this.conditions;
}

Feature.prototype.nonTable = function(builder){
  delete this.conditions.TableName;
}

// TODO Need to refactor
Feature.prototype.createTable = function(builder){

  this.nextThen = 'createTable';

  var items = {
    AttributeDefinitions: [],
    KeySchema: [],
    TableName: builder._schema.tableName,
    ProvisionedThroughput: builder._schema.tableInfo.ProvisionedThroughput
  };

  _.each(builder._schema._schema, function(s, key){
    items.AttributeDefinitions.push({
      AttributeName: key,
      AttributeType: s.type
    });

    items.KeySchema.push({
      AttributeName: key,
      KeyType: s.chainable.attributes().keyType
    });
  });

  _.each(builder.childBuilders, function(def){
    var indexType = def._schema.IndexType;
    if(!items[indexType]) items[indexType] = [];

    var KeySchema = [];

    _.each(def._schema._schema, function(s, key){

      var alreadyDefined = _.find(items.AttributeDefinitions, function(ad){
        return (ad.AttributeName == key);
      });

      if(!alreadyDefined)
        items.AttributeDefinitions.push({
          AttributeName: key,
          AttributeType: s.type
        });

      KeySchema.push({
        AttributeName: key,
        KeyType: s.chainable.attributes().keyType
      });
    });

    var tableInfo = {
      KeySchema: KeySchema
    };

    _.extend(tableInfo, def._schema.tableInfo);

    items[indexType].push(tableInfo);
  });

  _.extend(this.conditions, items);
}

Feature.prototype.callNextThen = function(){
  var self = this;

  return this.client[this.nextThen](this.toBuilder()).then(function(data){
    self.emit(self.callbacks.afterQuery);
    return data;
  });
}
