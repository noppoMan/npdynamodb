'use strict';

var npdynamodb = require('../index');
var chai = require('chai');
var expect = chai.expect;

var npd = npdynamodb.createClient(require('./dynamodb_2012_08_10'));

var Chat = npdynamodb.define('chats', {
  npdynamodb: npd,

  hashKey: 'room_id',

  rangeKey: 'timestamp',

  customProtoConstant: 1,

  customProtoMethod: function(){
    return this.get('timestamp') === 1429291245;
  }
},

{

  customStaticConstant: 1,

  customStaticMethod: function(){
    return this.where('room_id', 'room1')
      .query(function(qb){
        qb.filter('timestamp', '>', 1429291245);
      })
      .fetch();
  }

});

describe('ORM', function(){

  beforeEach(function(done){
    npd().rawClient().createTable(require('./data/test_tables').chats)
    .then(function(data){
      return npd().table('chats').create([
        {
          room_id: "room1",
          timestamp: 1429291245,
          message: 'This is first message'
        },
        {
          room_id: "room1",
          timestamp: 1429291246,
          message: 'This is second message'
        }
      ])
      .then(function(){
        done();
      });
    })
    .catch(function(err){
      done(err);
    });
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

  it('Should get a row with hash and range key', function(done){
    Chat.find("room1", 1429291245)
    .then(function(chat){
      expect(chat.get('room_id')).to.equal('room1');
      expect(chat.get('timestamp')).to.equal(1429291245);
      done();
    })
    .catch(function(err){
      done(err);
    });
  });

  it('Should get item collection and processing it with functional apis', function(done){
    Chat.query(function(qb){
      qb.where('room_id', 'room1');
    })
    .fetch()
    .then(function(chatCollection){
      expect(chatCollection.pluck("room_id")).to.deep.equal(['room1', 'room1']);
      return chatCollection;
    })
    .then(function(chatCollection){
      var chat = chatCollection.first();
      expect(chat.get("room_id")).to.equal('room1');
      expect(chat.get("timestamp")).to.equal(1429291245);
      return chatCollection;
    })
    .then(function(chatCollection){
      var chat = chatCollection.last();
      expect(chat.get("room_id")).to.equal('room1');
      expect(chat.get("timestamp")).to.equal(1429291246);
      return chatCollection;
    })
    .then(function(chatCollection){
      var chat = chatCollection.filter(function(chat){
        return chat.get('timestamp') == 1429291245;
      });
      expect(chat.length).to.equal(1);
      expect(chat[0].get("timestamp")).to.equal(1429291245);
      return chatCollection;
    })
    .then(function(chatCollection){
      var chats = chatCollection.map(function(chat){
        chat.set('timestamp', chat.get('timestamp') -1);
        return chat;
      });
      expect(chats[0].get("timestamp")).to.equal(1429291244);
      expect(chats[1].get("timestamp")).to.equal(1429291245);
      return chatCollection;
    })
    .then(function(chatCollection){
      expect(chatCollection.toArray().length).to.equal(2);
      return chatCollection;
    })
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    });
  });

  it('Should get multiple rows with whereIn(batchGetItem)', function(done){
    Chat.query(function(qb){
      qb.whereIn(['room_id', 'timestamp'], [['room1', 1429291245], ['room1', 1429291246]]);
    })
    .fetch()
    .then(function(chats){
      expect(chats.at(0).get('timestamp')).to.equal(1429291245);
      expect(chats.at(1).get('timestamp')).to.equal(1429291246);
      done();
    })
    .catch(function(err){
      done(err);
    });
  });

  describe('save', function(){

    it('Should save an item statically', function(done){
      Chat.save({
        room_id: "room2",
        timestamp: 1429291247,
        message: 'This is message'
      })
      .then(function(chat){
        expect(chat.get('room_id')).to.equal('room2');
        expect(chat.get('timestamp')).to.equal(1429291247);
        expect(chat.get('message')).to.equal('This is message');
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it("Should save an item from ORM Instance", function(done){

      var chat = new Chat({
        room_id: 'room2',
        timestamp: 1429291247
      });

      chat.set('message', 'This is message');

      chat.save()
      .then(function(chat){
        expect(chat.get('room_id')).to.equal('room2');
        expect(chat.get('timestamp')).to.equal(1429291247);
        expect(chat.get('message')).to.equal('This is message');
        return chat.set('message', "This is updated message").save();
      })
      .then(function(chat){
        //update
        expect(chat.get('message')).to.equal('This is updated message');
        done();
      })
      .catch(function(err){
        done(err);
      });
    });

    it("Should each models in collection save changes", function(done){
      Chat.where('room_id', 'room1').fetch().then(function(chats){
        return chats.first().set('message', 'this is a updated message').save()
        .then(function(chat){
          return chat.reload();
        });
      })
      .then(function(chat){
        expect(chat.get('message')).to.equal('this is a updated message');
        done();
      })
      .catch(done);
    });

  });

  describe('destroy', function(){
    it('Should destroy an item', function(done){

      Chat.save({
        room_id: "room2",
        timestamp: 1429291247,
        message: 'This is message'
      })
      .then(function(chat){
        return chat.destroy();
      })
      .then(function(data){
        Chat.find("room2", 1429291247).then(function(chat){
          expect(chat.isEmpty()).to.equal(true);
          done();
        });
      })
      .catch(function(err){
        done(err);
      });
    });
  });

  describe('Custom prototype method and props', function(){
    it('Custom property should equals with expected value', function(done){
      Chat.find("room1", 1429291245).then(function(chat){
        expect(chat.customProtoConstant).to.equal(1);
        done();
      });
    });

    it('Should call custom method and that result should be true', function(done){
      Chat.find("room1", 1429291245).then(function(chat){
        expect(chat.customProtoMethod()).to.equal(true);
        done();
      });
    });

    it('Should call custom method and that result should be expected values', function(done){
      Chat.where('room_id', 'room1').fetch().then(function(chats){
        expect(chats.indexAt(0).customProtoMethod()).to.equal(true);
        expect(chats.indexAt(1).customProtoMethod()).to.equal(false);
        done();
      });
    });
  });

  describe('Custom static method and props', function(){
    it('Custom property should equals with expected value', function(){
      expect(Chat.customStaticConstant).to.equal(1);
    });

    it('Should get rows with custom method', function(done){
      Chat.customStaticMethod().then(function(data){
        expect(data.pluck('timestamp')).to.deep.equal([1429291246]);
        done();
      });
    });
  });

  describe('Customizability', function(){

    it('Collection.prototype should be extended', function(done){
      var Collection = npdynamodb.Collection;
      Collection.prototype.pluckRoomId = function(){
        return this.pluck('room_id');
      };

      Chat.where('room_id', 'room1').fetch().then(function(collection){
        expect(collection.pluckRoomId()).to.deep.eq(['room1', 'room1']);
        done();
      });
    });

    it('Model.prototype should be extended', function(done){
      var Model = npdynamodb.Model;
      Model.prototype.relativeTime = function(){
        return parseInt(new Date() / 1000) - parseInt(this.get('timestamp'));
      };

      var Chat = npdynamodb.define('chats', {
        npdynamodb: npd,

        hashKey: 'room_id',

        rangeKey: 'timestamp',
      });

      Chat.find('room1', 1429291245).then(function(model){
        expect(model.relativeTime()).to.be.an('number');
        done();
      });
    });
  });

});
