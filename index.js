'use strict';

// For Browser
if(typeof(window) === 'object') {
  window.npdynamodb = exports;
  window.DynamoDBDatatype = require('./node_modules/dynamodb-doc/lib/datatypes').DynamoDBDatatype;
  window.DynamoDBFormatter = require('./node_modules/dynamodb-doc/lib/formatter').DynamoDBFormatter;
}

exports.version = require('./package.json').version;

exports.createClient = require('./lib/npdynamodb');

exports.define = require('./lib/orm/index');

exports.Collection = require('./lib/orm/collection');

exports.Model = require('./lib/orm/model');

exports.Migrator = require('./lib/migrate/migrator');
