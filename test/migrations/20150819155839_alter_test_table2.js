'use strict';

exports.up = function(migrator, config){
  return migrator().updateTable('test_table2', function(t){
    t.globalSecondaryIndexUpdates(function(t){
      t.delete('indexName2');
      t.update('indexName1', function(t){
        t.provisionedThroughput(20, 20);
      });
    });
  }).then(function(){
    return migrator().waitUntilTableActivate('test_table2');
  });
};

exports.down = function(migrator, config){
  return migrator().updateTable('test_table2', function(t){
    t.globalSecondaryIndexUpdates(function(t){
      t.create('indexName2', function(t){
        t.number('gsi_hash_key2').hashKey();
        t.provisionedThroughput(100, 100);
        t.projectionTypeAll();
      });
      t.update('indexName1', function(t){
        t.provisionedThroughput(10, 10);
      });
    });
  });
};
