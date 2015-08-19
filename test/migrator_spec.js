'use strict';

var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');

var SchemaBuilder = require('../lib/schema/builder');
var Migrator = require('../lib/migrate/migrator');
var npdynamodb = require('../index');

var dynamodb = require('./dynamodb_2012_08_10');
var npd = npdynamodb.createClient(dynamodb);

var migrator = new Migrator.Runner({
  cwd: __dirname + "/migrations",
  dynamoClient: dynamodb,
  migrations: {
    ProvisionedThroughput: [10, 10],
    tableName: 'npd_migrations_for_testing'
  }
});

describe('Migrator', function(){

  before(function(done){
    Promise.all([
      npd().rawClient().deleteTable({ TableName: 'test_table1'}),
      npd().rawClient().deleteTable({ TableName: 'test_table2' }),
      npd().rawClient().deleteTable({ TableName: 'npd_migrations_for_testing' })
    ])
    .then(function(){
      done();
    })
    .catch(function(){
      done();
    });
  });

  describe('run', function(){
    it("Should create test_table1 and test_table2", function(done){
      migrator.run().then(function(data){
        return Promise.all([
          npd().table('test_table1').describe(),
          npd().table('test_table2').describe(),
        ]);
      })
      .then(function(tables){
        expect(tables[0].Table.TableName).to.equal('test_table1');
        expect(tables[1].Table.TableName).to.equal('test_table2');
        done();
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('rollback', function(){
    it("Should delete test_table2 and remove value of 20150404071722 from npd_migrations_for_testing", function(done){
      migrator.rollback().then(function(data){
        migrator.rollback().then(function(data){
          migrator.rollback().then(function(data){

            npd().table('test_table2').describe()
            .then(function(data){
              done(new Error('Here is never called'));
            })
            .catch(function(err){
              expect(err.name).to.equal('ResourceNotFoundException');

              npd().table('npd_migrations_for_testing').where('version', 20150404071722)
              .then(function(data){
                expect(data.Count).to.equal(0);
                done();
              });
            });
          });
        });
      });
    });
  });
});
