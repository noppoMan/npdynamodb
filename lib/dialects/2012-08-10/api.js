var _ = require('lodash');
var utils = require('../../utils');

var operations;
var dynamoApiJsonPath = 'aws-sdk/apis/dynamodb-2012-08-10.min.json';

try {
  operations = require(dynamoApiJsonPath).operations;
} catch(e) {
  var fs = require('fs');
  var pathFromWorkingDir = process.cwd() + "/node_modules/" + dynamoApiJsonPath;
  if(fs.existsSync(pathFromWorkingDir)){
    operations = require(pathFromWorkingDir).operations;
  }else{
    throw new TypeError("Module `aws-sdk` is required for npdynamodb");
  }
}

//available methods.(api version 2012-08-10)
var apis = [
  {
    origin: 'createTable',
    transformed: 'createTable'
  },

  {
    origin: 'deleteTable',
    transformed: 'deleteTable'
  },

  {
    origin: 'deleteItem',
    transformed: 'delete'
  },

  {
    origin: 'describeTable',
    transformed: 'describe'
  },

  {
    origin: 'listTables',
    transformed: 'showTables',
  },

  {
    origin: 'putItem',
    transformed: 'create'
  },

  {
    origin: 'updateItem',
    transformed: 'update'
  },

  {
    origin: 'getItem',
    transformed: 'first'
  },

  {
    origin: 'query',
    transformed: 'query',
  },

  {
    origin: 'scan',
    transformed: 'all'
  },

  {
    origin: 'updateTable',
    transformed: 'alterTable'
  },

  {
    origin: 'waitFor',
    transformed: 'waitFor'
  }
];

var transformOperatorMap = {
  '=' : 'EQ',
  '!=': 'NE',
  '<=': 'LE',
  '<': 'LT',
  '>=': 'GE',
  '>': 'GT',
};

module.exports = {
  operations: operations,

  originalApis: _.keys(operations).map(function(api){
    return _.camelCase(api);
  }).concat(['waitFor']),

  transformFunctionMap: utils.collectionFlatten(apis.map(function(api){
    return utils.newObject(api.transformed, api.origin);
  })),

  transformOperatorMap: transformOperatorMap,

  availableOperators: _.keys(transformOperatorMap)
};
