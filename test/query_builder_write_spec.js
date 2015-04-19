'use strict';

var chai = require('chai');
var expect = chai.expect;

var npdynamodb = require('../index');
var npd = npdynamodb.createClient(require('./dynamodb_2012_08_10'));

var complexTableData = require('./data/complex_table_seed');

describe('QueryBuilder', function(){

  beforeEach(function(done){
    npd().rawClient().createTable(require('./data/test_tables').chats)
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    })
  });

  afterEach(function(done){
    npd().rawClient().deleteTable({
      TableName: 'chats'
    })
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    });
  });

  describe('save', function(){

    it('Should Create a new row', function(done){
      npd().table('chats')
      // .feature(function(f){
      //   f.returnConsumedCapacity('TOTAL');
      //   f.returnItemCollectionMetrics('SIZE');
      //   f.returnValues('ALL_OLD');
      // })
      .save({
        room_id: "room1",
        timestamp: 1429291245,
        message: 'This is message'
      })
      .then(function(data){
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should Update existing row', function(done){

      npd().table('chats')
      .save({
        room_id: "room1",
        timestamp: 1429291245,
        message: 'This is message'
      })
      .then(function(){
        return npd().table('chats')
        .save({
          room_id: "room1",
          timestamp: 1429291245,
          message: 'This is updated message'
        });
      })
      .then(function(data){
        npd().table('chats')
        .where('room_id', 'room1')
        .where('timestamp', 1429291245)
        .then(function(data){
          expect(data.Items[0].message).to.equal('This is updated message')
          done();
        });
      })
      .catch(function(err){
        done(err);
      });
    });

    it('Should batch create rows', function(done){
      npd().table('chats')
      .save([
        {
          room_id: "room1",
          timestamp: 1429291246,
          message: 'This is first message'
        },
        {
          room_id: "room1",
          timestamp: 1429291247,
          message: 'This is second message'
        },
        {
          room_id: "room1",
          timestamp: 1429291248,
          message: 'This is third message2'
        }
      ])
      .then(function(data){
        expect(Object.keys(data.UnprocessedItems).length).to.equal(0);
        done();
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('delete', function(){
    it('Should delete a row', function(done){
      npd().table('chats')
      .save({
        room_id: "room1",
        timestamp: 1429291245,
        message: 'This is message'
      })
      .then(function(){
        return npd().table('chats').where('room_id', 'room1').where('timestamp', 1429291245).delete();
      })
      .then(function(data){
        npd().table('chats')
        .where('room_id', 'room1')
        .where('timestamp', 1429291245)
        .then(function(data){
          expect(data.Count).to.equal(0);
          done();
        });
      })
      .catch(function(err){
        done(err);
      });
    });
  });

});
