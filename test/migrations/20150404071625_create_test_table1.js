'use strict';

exports.up = function(migrator){
  return migrator().createTable('test_table1', function(t){
    t.string('hash_key').hashKey();
    t.number('range_key').rangeKey();
    t.provisionedThroughput(100, 100);

    t.globalSecondaryIndex('indexName1', function(t){
      t.string('gsi_hash_key').hashKey();
      t.provisionedThroughput(100, 100);
      t.projectionTypeAll();
    });

    t.localSecondaryIndex('indexName2', function(t){
      t.string('hash_key').hashKey();
      t.number('lsi_range_key').rangeKey();
      t.projectionTypeAll();
    });
  });
};

exports.down = function(migrator){
  return migrator().deleteTable('test_table1');
};
