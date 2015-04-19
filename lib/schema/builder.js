'use strict';

var types = require('./types');
var Chainable = require('./chainable');
var _ = require('lodash');
var utils = require('../utils');

module.exports = SchemaBuilder;

function SchemaBuilder(options){
  this._schema = new Schema(options);

  this.childBuilders = [];

  this.initialized = false;

  this.builtSchema = {
    hashKeys: [],
    rangeKeys: [],
    struct: {},
  };
};

_.each(_.omit(types, 'map', 'list'), function(originalType, npdType){
  SchemaBuilder.prototype[npdType] = function(column){
    var chainable = new Chainable();
    this._schema.extend(
      utils.newObject(column, {
        type: originalType,
        chainable: chainable
      })
    );
    return chainable;
  }
});

SchemaBuilder.prototype.provisionedThroughput = function(r, w){
  this._schema.tableInfo.ProvisionedThroughput.ReadCapacityUnits = r;
  this._schema.tableInfo.ProvisionedThroughput.WriteCapacityUnits = r;
}

SchemaBuilder.prototype.ProjectionTypeAll = function() {
  this._schema.tableInfo.Projection.ProjectionType = 'ALL';
}

SchemaBuilder.prototype.ProjectionTypeKeysOnly = function() {
  this._schema.tableInfo.Projection.ProjectionType = 'KEYS_ONLY';
}

SchemaBuilder.prototype.ProjectionTypeInclude = function(nonKeyAttributes) {
  var projection = {
    ProjectionType: 'INCLUDE'
  }
  if(_.isArray(nonKeyAttributes)) projection.NonKeyAttributes = nonKeyAttributes;

  _.extend(this._schema.tableInfo.Projection, projection);
}

SchemaBuilder.prototype.globalSecondaryIndex = function(indexName, callback){
  callback(this.__newBuilder({
    IndexType: Schema.IndexType.GSI,
    tableInfo: {
      IndexName: indexName
    }
  }));
}

SchemaBuilder.prototype.localSecondaryIndex = function(indexName, callback){
  var def = this.__newBuilder({
    IndexType: Schema.IndexType.LSI,
    tableInfo: {
      IndexName: indexName
    }
  });

  def._schema.tableInfo = _.omit(def._schema.tableInfo, 'ProvisionedThroughput');

  callback(def);
}

SchemaBuilder.prototype.__newBuilder = function(params){
  var child = new SchemaBuilder(params);
  this.childBuilders.push(child);
  return child;
}

SchemaBuilder.prototype.build = function(){
  return require('../dialects/' + this._schema.apiVer + "/schema").build.call(this);
}

Schema.IndexType = {
  DEFAULT: 'Default',
  GSI: 'GlobalSecondaryIndexes',
  LSI: 'LocalSecondaryIndexes'
};

function Schema(options){
  this.apiVer;

  this.tableName;

  this.column;

  this.type;

  this._schema = {};

  this.IndexType = Schema.IndexType.DEFAULT;

  this.tableInfo = {
    IndexName: null,
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    },
    Projection: {
      ProjectionType: 'NONE'
    }
  };

  this.mergeProps(options);
}

Schema.prototype.extend = function(props){
  _.extend(this._schema, props);
}

Schema.prototype.mergeProps = function(props){
  var keys = _.keys(props);
  var self = this;
  keys.forEach(function(key){
    if(_.isObject(props[key])) {
      self[key] = _.extend(self[key], props[key]);
    }else{
      self[key] = props[key];
    }
  });
}
