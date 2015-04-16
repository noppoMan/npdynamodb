var types = require('./types');
var Chainable = require('./chainable');
var _ = require('lodash');

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
    var o = {};
    var chainable = new Chainable();
    o[column] = {
      type: originalType,
      chainable: chainable
    };

    this._schema.extend(o);
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
  delete def._schema.tableInfo.ProvisionedThroughput;
  callback(def);
}

SchemaBuilder.prototype.__newBuilder = function(params){
  var child = new SchemaBuilder(params);
  this.childBuilders.push(child);
  return child;
}

SchemaBuilder.prototype.list = function(column, callback){
  callback(this.__newBuilder({
    column: column,
    type: 'L'
  }));
}

SchemaBuilder.prototype.map = function(column, callback){
  if(typeof column == 'function') {
    callback = column;
    column = null;
  }

  callback(this.__newBuilder({
    column: column,
    type: 'M'
  }));
}

SchemaBuilder.prototype.build = function(){
  if(this.initialized) return this.builtSchema;

  function _build(builder){

    var builtSchema = {};

    function __build(builder, builtSchema){
      if(!builder._schema.isEmpty()) {
        _.extend(builtSchema, builder._schema.parseAttributes());
      }

      for(var key in builder.childBuilders) {
        var cBuilder = builder.childBuilders[key];
        var columNname = cBuilder._schema.column;

        if(columNname === null){
          if(!builtSchema[cBuilder._schema.type])
            builtSchema[cBuilder._schema.type] = {};

          __build(cBuilder, builtSchema[cBuilder._schema.type]);
        }else{
          if(!builtSchema[columNname])
            builtSchema[columNname] = {};

          if(!builtSchema[columNname][cBuilder._schema.type])
            builtSchema[columNname][cBuilder._schema.type] = {};

          __build(cBuilder, builtSchema[columNname][cBuilder._schema.type]);
        }
      }
    }

    __build(builder, builtSchema);
    return builtSchema;
  }

  this.builtSchema = {
    hashKeys: null,
    rangeKey: null,
    struct: _build(this)
  };

  this.initialized = true;

  return this.builtSchema;
}

Schema.IndexType = {
  DEFAULT: 'Default',
  GSI: 'GlobalSecondaryIndexes',
  LSI: 'LocalSecondaryIndexes'
};

function Schema(options){
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

Schema.prototype.isEmpty = function(props){
  return _.isEmpty(this._schema);
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

Schema.prototype.parseAttributes = function(){
  var parsed = {};
  _.each(this._schema, function(struct, column){
    parsed[column] = {};
    parsed[column][struct.type] = struct.chainable.attributes();
  });

  return parsed;
}
