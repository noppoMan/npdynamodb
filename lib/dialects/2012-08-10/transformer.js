var _ = require('lodash');
var utils = require('../../utils');

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

  transformFunctionMap: utils.collectionFlatten(apis.map(function(api){
    return utils.newObject(api.transformed, api.origin);
  })),

  transformOperatorMap: transformOperatorMap,

  availableOperators: _.keys(transformOperatorMap)
}
