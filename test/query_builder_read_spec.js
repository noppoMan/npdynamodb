'use strict';

var Promise = require('bluebird')
var chai = require('chai');
var expect = chai.expect;

var npdynamodb = require('../index');
var npd = npdynamodb.createClient(require('./dynamodb_2012_08_10'));

var complexTableData = require('./data/complex_table_seed');

function expectQueryResult(data, count, startIndex, done){
  expect(data.Count).to.equal(count);
  data.Items.forEach(function(item, i){
    expect(item.hash_key).to.equal('key1');
    expect(item.range_key).to.equal(startIndex+i);
  });
  done();
}

function expectQueryResultMinus(data, count, startIndex, done){
  expect(data.Count).to.equal(count);
  data.Items.forEach(function(item, i){
    expect(item.hash_key).to.equal('key1');
    expect(item.range_key).to.equal(startIndex-i);
  });
  done();
}

describe('QueryBuilder', function(){
  before(function(done){
    npd().rawClient().createTable(require('./data/test_tables').compex_table)
    .then(function(){
      return npd().table('complex_table').save(complexTableData);
    })
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    })
  });

  after(function(done){
    npd().rawClient().deleteTable({
      TableName: 'complex_table'
    })
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    });
  });

  describe('all', function(){
    it('Should get amount of rows', function(done){
      npd().table('complex_table').all()
      .then(function(data){
        expectQueryResult(data, 10, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('select', function(){
    it('Should get row with specified attributes', function(done){
      npd().table('complex_table')
      .select('document', 'numberSet')
      .where('hash_key', 'key1')
      .where('range_key', 1)
      .then(function(data){
        var item = data.Items[0];
        expect(item.hash_key).to.equal(undefined);
        expect(item).to.have.property("document");
        expect(item).to.have.property("numberSet");
        done();
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('where*', function(){
    it('Should find row with where(hash_key=key1 and range_key=1)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('range_key', 1)
      .then(function(data){
        expectQueryResult(data, 1, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with where(hash_key=key1 and range_key > 8)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('range_key', '>', 8)
      .then(function(data){
        expectQueryResult(data, 2, 9, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with where(hash_key=key1 and range_key >= 8)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('range_key', '>=', 8)
      .then(function(data){
        expectQueryResult(data, 3, 8, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with where(hash_key=key1 and range_key <= 3)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('range_key', '<=', 3)
      .then(function(data){
        expectQueryResult(data, 3, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with where(hash_key=key1 and range_key < 3)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('range_key', '<', 3)
      .then(function(data){
        expectQueryResult(data, 2, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with whereBetween', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .whereBetween('range_key', 1, 3)
      .then(function(data){
        expectQueryResult(data, 3, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('filter*', function(){

    it('Should find rows with filter(range_key = 1)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filter('range_key', '=', 1)
      .then(function(data){
        expectQueryResult(data, 1, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filter(range_key != 1)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filter('range_key', '!=', 1)
      .then(function(data){
        expectQueryResult(data, 9, 2, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filter(range_key > 8)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filter('range_key', '>', 8)
      .then(function(data){
        expectQueryResult(data, 2, 9, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filter(range_key >= 8)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filter('range_key', '>=', 8)
      .then(function(data){
        expectQueryResult(data, 3, 8, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filter(range_key <= 3)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filter('range_key', '<=', 3)
      .then(function(data){
        expectQueryResult(data, 3, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filter(range_key < 3)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filter('range_key', '<', 3)
      .then(function(data){
        expectQueryResult(data, 2, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });


    it('Should find rows with filterIn(range_key (1,2))', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterIn('range_key', 1, 2)
      .then(function(data){
        expectQueryResult(data, 2, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterBeginsWith(gsi_hash_key "g")', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterBeginsWith('gsi_hash_key', 'g')
      .then(function(data){
        expectQueryResult(data, 10, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterBeginsWith(gsi_hash_key "hoge")', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterBeginsWith('gsi_hash_key', 'hoge')
      .then(function(data){
        expect(data.Count).to.equal(0);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterBetween(range_key 1..5 )', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterBetween('range_key', 1, 5)
      .then(function(data){
        expectQueryResult(data, 5, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterContains(stringSet "foo")', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterContains('stringSet', "foo")
      .then(function(data){
        expectQueryResult(data, 10, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterContains(numberSet 2)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterContains('numberSet', 2)
      .then(function(data){
        expectQueryResult(data, 10, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterNotContains(stringSet "foo")', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterNotContains('stringSet', "foo")
      .then(function(data){
        expect(data.Count).to.equal(0);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterNotContains(numberSet 2)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterNotContains('numberSet', 2)
      .then(function(data){
        expect(data.Count).to.equal(0);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterNull(document)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterNull('document')
      .then(function(data){
        expect(data.Count).to.equal(0);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find rows with filterNotNull(document)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .filterNotNull('document')
      .then(function(data){
        expectQueryResult(data, 10, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('count', function(){
    it('Should num of rows is 10', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .count()
      .then(function(data){
        expect(data.Count).to.equal(10);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should num of rows is 5 with limit', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .count()
      .limit(5)
      .then(function(data){
        expect(data.Count).to.equal(5);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('limit', function(){
    it('Should rows count same as specified limit', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .limit(4)
      .then(function(data){
        expect(data.Count).to.equal(4);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('order', function(){

    it('Should finding rows order is ascending', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .limit(4)
      .asc()
      .then(function(data){
        expectQueryResult(data, 4, 1, done);
      })
      .catch(function(err){
        done(err);
      });
    });


    it('Should finding rows order is descending', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .limit(4)
      .desc()
      .then(function(data){
        expectQueryResultMinus(data, 4, 10, done);
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('indexName', function(){
    it('Should find row with GlobalSecondaryIndex', function(done){
      npd().table('complex_table')
      .where('gsi_hash_key', 'gkey1')
      .indexName('indexName1')
      .then(function(data){
        var item = data.Items[0];
        expect(item.gsi_hash_key).to.equal('gkey1');
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should find row with LocalSecondaryIndex', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('lsi_range_key', 1)
      .indexName('indexName2')
      .then(function(data){
        var item = data.Items[0];
        expect(item.hash_key).to.equal("key1");
        expect(item.lsi_range_key).to.equal(1);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('events', function(){
    it('Should detect beforeQuery and afterQuery events', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('range_key', 1)
      .on('beforeQuery', function(params){
        expect(params).to.have.property("TableName");
        expect(params).to.have.property("KeyConditions");
      })
      .on('afterQuery', function(result){
        expect(result.Items[0].hash_key).to.equal("key1");
        expect(result.Items[0].range_key).to.equal(1);
      })
      .then(function(data){
        done();
      })
      .catch(function(err){
        done(err);
      });
    });
  });

});
