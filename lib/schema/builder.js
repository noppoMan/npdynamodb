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
    };
  });
}

SchemaBuilder.Schema = Schema;

SchemaBuilder.prototype._definePropsIfNotExists = function(propName){
  if(!this._schema.tableInfo[propName]) {
    this._schema.tableInfo[propName] = {};
  }
};

SchemaBuilder.prototype.provisionedThroughput = function(r, w){
  this._definePropsIfNotExists('ProvisionedThroughput');
  this._schema.tableInfo.ProvisionedThroughput.ReadCapacityUnits = r;
  this._schema.tableInfo.ProvisionedThroughput.WriteCapacityUnits = w;
};

SchemaBuilder.prototype.projectionTypeAll = function() {
  return this.ProjectionTypeAll();
};

SchemaBuilder.prototype.projectionTypeKeysOnly = function() {
  return this.ProjectionTypeKeysOnly();
};

SchemaBuilder.prototype.projectionTypeInclude = function() {
  return this.ProjectionTypeInclude();
};

/*******  TODO Will be duplicated in 0.3.x *******/
SchemaBuilder.prototype.ProjectionTypeAll = function() {
  this._definePropsIfNotExists('Projection');
  this._schema.tableInfo.Projection.ProjectionType = 'ALL';
};

SchemaBuilder.prototype.ProjectionTypeKeysOnly = function() {
  this._definePropsIfNotExists('Projection');
  this._schema.tableInfo.Projection.ProjectionType = 'KEYS_ONLY';
};

SchemaBuilder.prototype.ProjectionTypeInclude = function(nonKeyAttributes) {
  var projection = {
    ProjectionType: 'INCLUDE'
  };
  if(_.isArray(nonKeyAttributes)) projection.NonKeyAttributes = nonKeyAttributes;

  _.extend(this._schema.tableInfo.Projection, projection);
};
/*******  TODO Will be duplicated in 0.3.x *******/

SchemaBuilder.prototype.streamSpecificationEnabled = function(bool){
  this._definePropsIfNotExists('StreamSpecification');
  this._schema.tableInfo.StreamSpecification.StreamEnabled = bool;
};

SchemaBuilder.prototype.streamSpecificationViewType = function(type){
  this._definePropsIfNotExists('StreamSpecification');
  this._schema.tableInfo.StreamSpecification.StreamViewType = type;
};

SchemaBuilder.prototype.globalSecondaryIndex = function(indexName, callback){
  callback(this.__newBuilder({
    IndexType: Schema.IndexType.GSI,
    tableInfo: {
      IndexName: indexName
    }
  }));
};

SchemaBuilder.prototype.globalSecondaryIndexUpdates = function(callback){
  var self = this;

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function __newBuilder(indexName, action) {
    return self.__newBuilder({
      IndexName: indexName,
      Action: action,
      withoutDefaultTableInfo: true
    });
  }

  var actions = {
    create: function(indexName, callback){
      var builder = __newBuilder(indexName, 'Create');
      callback(builder);
    },

    delete: function(indexName){
      var builder = __newBuilder(indexName, 'Delete');
    },

    update: function(indexName, callback){
      var builder = __newBuilder(indexName, 'Update');
      callback(builder);
    }
  };

  callback(actions);
};

SchemaBuilder.prototype.localSecondaryIndex = function(indexName, callback){
  var def = this.__newBuilder({
    IndexType: Schema.IndexType.LSI,
    tableInfo: {
      IndexName: indexName
    }
  });

  def._schema.tableInfo = _.omit(def._schema.tableInfo, 'ProvisionedThroughput');

  callback(def);
};

SchemaBuilder.prototype.__newBuilder = function(params){
  var child = new SchemaBuilder(params);
  this.childBuilders.push(child);
  return child;
};

['buildCreateTable', 'buildUpdateTable'].forEach(function(name){
  SchemaBuilder.prototype[name] = function(){
    return require('../dialects/' + this._schema.apiVer + "/schema")[name].call(this);
  };
});

Schema.IndexType = {
  DEFAULT: 'Default',
  GSI: 'GlobalSecondaryIndexes',
  GSIU: 'GlobalSecondaryIndexUpdates',
  LSI: 'LocalSecondaryIndexes'
};

function Schema(options){
  this.apiVer;

  this.tableName;

  this.column;

  this.type;

  this._schema = {};

  this.IndexType = Schema.IndexType.DEFAULT;

  this.tableInfo = options.withoutDefaultTableInfo ? {} : {
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
};

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
};
