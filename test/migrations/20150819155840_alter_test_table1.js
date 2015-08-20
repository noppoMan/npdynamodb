'use strict';

exports.up = function(migrator, config){
  return migrator().updateTable('test_table1', function(t){
    t.globalSecondaryIndexUpdates(function(t){
      t.create('indexName3', function(t){
        t.string('hash_key2').hashKey();
        t.provisionedThroughput(100, 100);
        t.projectionTypeAll();
      });
    });
  }).then(function(){
    return migrator().waitUntilTableActivate('test_table1');
  });
};

exports.down = function(migrator, config){
  return migrator().updateTable('test_table1', function(t){
    t.globalSecondaryIndexUpdates(function(t){
      t.delete('indexName3');
    });
  });
};
