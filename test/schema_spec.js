'use strict';

var chai = require('chai');
var expect = chai.expect;

var SchemaBuilder = require('../lib/schema/builder');

describe('Schema', function(){

  it("Should build schema(which contain globalSecondaryIndex and localSecondaryIndex) for createTable operation for 2012-08-10 api", function(){
    var t = new SchemaBuilder({
      apiVer: '2012-08-10',
      tableName: "complex_table"
    });

    t.string('hash_key').hashKey();
    t.binary('range_key').rangeKey();
    t.provisionedThroughput(100, 100);

    t.globalSecondaryIndex('indexName1', function(t){
      t.string('gsi_hash_key').hashKey();
      t.provisionedThroughput(100, 100);
      t.projectionTypeAll();
    });

    t.globalSecondaryIndex('indexName2', function(t){
      t.number('gsi_hash_key2').hashKey();
      t.provisionedThroughput(100, 100);
      t.projectionTypeAll();
    });

    t.globalSecondaryIndex('indexName3', function(t){
      t.binary('gsi_hash_key3').hashKey();
      t.provisionedThroughput(100, 100);
      t.projectionTypeAll();
    });

    t.localSecondaryIndex('indexName4', function(t){
      t.string('hash_key').hashKey();
      t.number('lsi_range_key').rangeKey();
      t.projectionTypeAll();
    });

    t.localSecondaryIndex('indexName5', function(t){
      t.string('hash_key').hashKey();
      t.string('lsi_range_key2').rangeKey();
      t.projectionTypeAll();
    });

    t.localSecondaryIndex('indexName6', function(t){
      t.string('hash_key').hashKey();
      t.binary('lsi_range_key3').rangeKey();
      t.projectionTypeAll();
    });

    expect(t.buildCreateTable()).to.deep.equal(require('./data/test_tables').for_schema_test);
  });

});
