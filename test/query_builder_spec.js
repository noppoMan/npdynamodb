var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: process.env['DYNAMO_KEY'] || "AWS_KEY",
  secretAccessKey: process.env['DYNAMO_SECRET_KEY'] || "AWS_SECRET",
  region: process.env['AWS_REGION'] || "ap-northeast-1",
  sslEnabled: false,
  endpoint: process.env['DYNAMO_ENDPOINT'] || 'localhost:8000'
});

var chai = require('chai');
var expect = chai.expect;

var npdynamodb = require('../index');
var npd = npdynamodb.createClient(dynamodb);

var complexTableData = require('./data/complex_table_seed');

describe('QueryBuilder', function(){
  before(function(done){
    npd().table('complex_table').import(complexTableData)
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    })
  });

  describe('where*', function(){
    it('Should find row with where(hash_key=key1 and range_key=1)', function(done){
      npd().table('complex_table')
      .where('hash_key', 'key1')
      .where('range_key', 1)
      .then(function(data){
        var item = data.Items[0];
        expect(item.hash_key).to.equal('key1');
        expect(item.range_key).to.equal(1);
        done();
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
        expect(data.Count).to.equal(2);
        data.Items.forEach(function(item, i){
          expect(item.hash_key).to.equal('key1');
          expect(item.range_key).to.equal(9+i);
        });
        done();
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
        expect(data.Count).to.equal(3);
        data.Items.forEach(function(item, i){
          expect(item.hash_key).to.equal('key1');
          expect(item.range_key).to.equal(8+i);
        });
        done();
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
        expect(data.Count).to.equal(3);
        data.Items.forEach(function(item, i){
          expect(item.hash_key).to.equal('key1');
          expect(item.range_key).to.equal(1+i);
        });
        done();
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
        expect(data.Count).to.equal(2);
        data.Items.forEach(function(item, i){
          expect(item.hash_key).to.equal('key1');
          expect(item.range_key).to.equal(1+i);
        });
        done();
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
        expect(data.Count).to.equal(3);
        data.Items.forEach(function(item, i){
          expect(item.hash_key).to.equal('key1');
          expect(item.range_key).to.equal(i+1);
        })
        done();
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


});
