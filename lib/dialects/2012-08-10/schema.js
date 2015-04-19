'use strict';

var _ = require('lodash');

// TODO Need to Refactor
exports.build = function(){

  var items = {
    AttributeDefinitions: [],
    KeySchema: [],
    TableName: this._schema.tableName,
    ProvisionedThroughput: this._schema.tableInfo.ProvisionedThroughput
  };

  _.each(this._schema._schema, function(s, key){
    items.AttributeDefinitions.push({
      AttributeName: key,
      AttributeType: s.type
    });

    items.KeySchema.push({
      AttributeName: key,
      KeyType: s.chainable.attributes().keyType
    });
  });

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
}
