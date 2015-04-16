var util = require('util');

exports.manager = require('./manager');

exports.builder = function(params){
  return require('./manager').firstOrCreate(params);
}


function SchemaNotDefinedException(name){
  this.name = "SchemaNotDefinedException";
  this.message = 'Schema ' + name + ' is not defined.';
}
util.inherits(SchemaNotDefinedException, Error);

exports.SchemaNotDefinedException = SchemaNotDefinedException;
