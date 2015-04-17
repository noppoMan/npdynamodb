var _ = require('lodash');

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
    transformed: 'save'
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


var transformFunctionMap = {};

apis.forEach(function(api){
  transformFunctionMap[api.transformed] = api.origin;
});

var transformOperatorMap = {
  '=' : 'EQ',
  '!=': 'NE',
  '<=': 'LE',
  '<': 'LT',
  '>=': 'GE',
  '>': 'GT',
};


module.exports = {

  transformFunctionMap: transformFunctionMap,

  transformOperatorMap: transformOperatorMap,

  availableOperators: _.keys(transformOperatorMap)
}
