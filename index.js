'use strict';

var _ = require('lodash');

// For Browser
if(typeof(window) === 'object') {
  window.npdynamodb = exports;
  window.DynamoDBDatatype = require('./node_modules/dynamodb-doc/lib/datatypes').DynamoDBDatatype;
  window.DynamoDBFormatter = require('./node_modules/dynamodb-doc/lib/formatter').DynamoDBFormatter;
}

exports.version = require('./package.json').version;

exports.createClient = require('./lib/npdynamodb');

exports.define = require('./lib/orm/index');

exports.Migrator = require('./lib/migrate/migrator');

var QueryBuilder = require('./lib/query_builder'),
  Collection = require('./lib/orm/collection'),
  Model = require('./lib/orm/model')
;

[QueryBuilder, Collection, Model].forEach(function(Klass){
  Klass.extend = function(protoProps, staticProps){
    _.extend(Klass.prototype, protoProps || {});
    _.extend(Klass, staticProps || {});
  };
});

exports.plugin = function(pluginFn){
  if(typeof pluginFn !== 'function') {
    throw new Error('The plugin must be function.');
  }
  pluginFn({
    QueryBuilder: QueryBuilder,
    Collection: Collection,
    Model: Model
  });
};

/*******  TODO Will be duplicated in 0.3.x *******/

exports.Collection = require('./lib/orm/collection');

exports.Model = require('./lib/orm/model');

/*******  TODO Will be duplicated in 0.3.x *******/
