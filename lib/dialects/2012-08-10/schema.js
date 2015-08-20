'use strict';

var _ = require('lodash');

function makeBaseItems(){
  var items = {
    TableName: this._schema.tableName
  };

  _.each(_.omit(this._schema.tableInfo, 'Projection'), function(val, key){
    if(!_.isEmpty(val)) {
      items[key] = val;
    }
  });

  var AttributeDefinitions = [], KeySchema = [];

  _.each(this._schema._schema, function(s, key){
    AttributeDefinitions.push({
      AttributeName: key,
      AttributeType: s.type
    });

    KeySchema.push({
      AttributeName: key,
      KeyType: s.chainable.attributes().keyType
    });
  });

  if(AttributeDefinitions.length > 0) {
    _.extend(items, {
      AttributeDefinitions: AttributeDefinitions,
      KeySchema: KeySchema
    });
  }

  return items;
}

// TODO Need to Refactor
exports.buildCreateTable = function(){

  var items = makeBaseItems.call(this);

  _.each(this.childBuilders, function(def){
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

    items[indexType].push(
      _.extend(tableInfo, def._schema.tableInfo)
    );
  });

  return items;
};

exports.buildUpdateTable = function(){

  var items = makeBaseItems.call(this);
  var indexType = this._schema.IndexType;

  items[indexType] = [];

  _.each(this.childBuilders, function(builder){
    var param = {};
    var act = builder._schema.Action;
    param[act] = {};

    if(builder._schema.Action === 'Create') {
      var KeySchema = [], AttributeDefinitions = [];
      _.each(builder._schema._schema, function(s, key){
        AttributeDefinitions.push({
          AttributeName: key,
          AttributeType: s.type
        });

        KeySchema.push({
          AttributeName: key,
          KeyType: s.chainable.attributes().keyType
        });
      });

      if(AttributeDefinitions.length > 0) {
        items.AttributeDefinitions = AttributeDefinitions;
        param[act].KeySchema = KeySchema;
      }
    }

    _.extend(param[act], builder._schema.tableInfo);

    param[act].IndexName = builder._schema.IndexName;

    items[indexType].push(param);
  });

  return items;
};
