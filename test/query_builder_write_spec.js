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
    .catch(done)
  });

  afterEach(function(done){
    npd().rawClient().deleteTable({
      TableName: 'chats'
    })
    .then(function(){
      done();
    })
    .catch(done);
  });

  describe('create', function(){

    it('Should Create a new row', function(done){
      npd().table('chats')
      // .feature(function(f){
      //   f.returnConsumedCapacity('TOTAL');
      //   f.returnItemCollectionMetrics('SIZE');
      //   f.returnValues('ALL_OLD');
      // })
      .create({
        room_id: "room1",
        timestamp: 1429291245,
        message: 'This is message'
      })
      .then(function(data){
        done();
      })
      .catch(done);
    });

    it('Should Update existing row', function(done){

      npd().table('chats')
      .create({
        room_id: "room1",
        timestamp: 1429291245,
        message: 'This is message'
      })
      .then(function(){
        return npd().table('chats')
        .create({
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
      .catch(done);
    });

    it('Should batch create rows', function(done){
      return npd().table('chats')
      .create([
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
      .catch(done);
    });
  });

  describe('update', function(){

    it('Should update message and add user_name field by update method', function(done){
      npd().table('chats')
      .create([
        {
          room_id: "room1",
          timestamp: 1429291246,
          message: 'This is first message',
          user: {
            name: "Tonny",
            age: 40
          }
        }
      ])
      .then(function(){
        return npd().table('chats')
          .where("room_id", "room1")
          .where('timestamp', 1429291246)
          .set("user", "PUT", {name: 'rhodes', age: 45})
          .set("gender_type", "ADD", 1)
          .feature(function(f){
            f.returnValues('UPDATED_NEW');
          })
          .update();
      })
      .then(function(data){
        expect(data).to.deep.equal({ Attributes: { gender_type: 1, user: { name: 'rhodes', age: 45 } } });
        done();
      })
      .catch(done);
    });

    it('Should update row with expressions', function(done){
      npd().table('chats')
      .create([
        {
          room_id: "room1",
          timestamp: 1429291246,
          message: 'This is first message',
          user: {
            name: "Tonny"
          }
        }
      ])
      .then(function(){
        return npd().table('chats')
          .where("room_id", "room1")
          .where('timestamp', 1429291245)
          .feature(function(f){
            f.updateExpression('SET #gt = if_not_exists(#gt, :one)');

            f.expressionAttributeNames({
              '#gt': 'gender_type'
            });

            f.expressionAttributeValues({
              ':one': 1
            });
            f.returnValues('UPDATED_NEW');
          })
          .update();
      })
      .then(function(data){
        expect(data).to.deep.equal({ Attributes: { gender_type: 1 } });
        done();
      })
      .catch(done);
    });
  });

  describe('delete', function(){
    it('Should delete a row', function(done){
      npd().table('chats')
      .create({
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
      .catch(done);
    });
  });

});
