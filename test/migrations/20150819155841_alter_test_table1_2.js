'use strict';

exports.up = function(migrator, config){
  return migrator().updateTable('test_table1', function(t){
    t.globalSecondaryIndexUpdates(function(t){
      t.create('indexName4', function(t){
        t.string('hash_key3').hashKey();
        t.provisionedThroughput(5, 5);
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
      t.delete('indexName4');
    });
  });
};
