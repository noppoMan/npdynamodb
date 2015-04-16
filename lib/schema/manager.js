var _ = require('lodash');
var Builder = require('./builder');

//Global shared Instance
module.exports = new SchemaManager();

function SchemaManager(){
  this._schemas = {};
}

SchemaManager.prototype.add = function(schema){
  _.extend(this._schemas, schema);
}

SchemaManager.prototype.get = function(key){
  return this._schemas[key];
}

SchemaManager.prototype.isAlreadyDefined = function(name){
  return this._schemas[name] != undefined;
}

SchemaManager.prototype.firstOrCreate = function(params){
  if(!this._schemas[params.tableName]) {
    this._schemas[params.tableName] = new Builder(params);
  }

  return this.get(params.tableName);
}
