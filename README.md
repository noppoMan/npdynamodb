# npdynamodb [![npm version](https://badge.fury.io/js/npdynamodb.svg)](http://badge.fury.io/js/npdynamodb) [![Code Climate](https://codeclimate.com/github/noppoMan/npdynamodb/badges/gpa.svg)](https://codeclimate.com/github/noppoMan/npdynamodb) [![Circle CI](https://circleci.com/gh/noppoMan/npdynamodb/tree/master.svg?style=svg)](https://circleci.com/gh/noppoMan/npdynamodb/tree/master)
A Node.js Simple Query Builder and ORM for AWS DynamoDB.

## Motivation
When I visited [here ](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property
) for the first time, I closed it in a moment.
Because it is too long and hard to see to understand.
So I decided to make client to handle DynamoDB more easier and it doesn't take waste of time to read documentation for it.

## Services that are used in Production
[<img src="https://raw.githubusercontent.com/noppoMan/npdynamodb/gh-pages/resources/chatcast_logo.png" width="250">](https://chatca.st)


## Supported DynamoDB Api Versions
* 2012-08-10

## Installation
```sh
npm install npdynamodb
```

## Why is the Pure AWS-SDK in Node.js NOT good?

Parameters are like Chant of the magic.
[http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)

## Overview
Npdynamodb has modern interfaces to handle AWS DynamoDB.
We release you redundancy codes and see simple syntax.
Of course, will not see callback hell!

Npdynamodb has the following functions
* [Simple QueryBuilder](https://github.com/noppoMan/npdynamodb/blob/master/README.md#usage-of-querybuilder)
* [Light ORM(Active Record Model Like)](https://github.com/noppoMan/npdynamodb/blob/master/README.md#usage-of-orm)
* [DynamoDB Migrator](https://github.com/noppoMan/npdynamodb/blob/master/README.md#migration)
* [Command Line Interface](https://github.com/noppoMan/npdynamodb/blob/master/README.md#command-line-interfaces)

### List of npdynamodb apis
* [QueryBuilder Apis](https://github.com/noppoMan/npdynamodb/blob/master/docs/query_builder_apis.md)
* [ORM Apis](https://github.com/noppoMan/npdynamodb/blob/master/docs/orm_apis.md)
* [Migration Apis](https://github.com/noppoMan/npdynamodb/blob/master/docs/migration_apis.md)

## Usage of QueryBuilder

Initialization
```js
var npdynamodb = require('npdynamodb');
var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

var npd = npdynamodb.createClient(dynamodb);

// Or can take options
var npd = npdynamodb.createClient(dynamodb, {
  timeout: 3000,
  initialize: function(){
    // Some Initialization here.
  }
});
```

##### Get by hash key (getItem operation)
```js
npd().table('users')
.where("id", 1)
.first()
.then(function(data){

  console.log(data)
  // => {Item: {id: 1, name: 'Tonny'}, Count: 1, ScannedCount: 1}

})
.catch(function(err){
  console.err(err);
});
```

##### Get rows with where (query operation)
```js
npd().table('users')
.where('name', 'tonny') //hash key
.then(function(data){

  console.log(data)
  // => {Items: [{id: 1, name: 'Tonny'}], Count: 1, ScannedCount: 1}

})
.catch(function(err){
  console.err(err);
});
```

##### Get multiple rows with where, filter and descending order
```js
npd().table('chats')
.where('room_id', 'room1') // hash key
.where('timestamp', '>', 1429454911) // range key
.filter('user_name', 'tonny') // non index key
.desc()
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```

##### whereIn
whereIn call batchGetItem instead of query operation.

###### Single Key Usage
```js
npd().table('chats')
.whereIn('room_id', ['room1', 'room2', 'room3'])
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```

###### Multiple Kyes Usage
```js
npd().table('chats')
.whereIn(['room_id', 'timestamp'], [['room1', 1429454911], ['room2', 1429454912], ['room3', 1429454913]])
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```

##### Limit and offset
```js
npd().table('chats')
.where('room_id', 'room1')
.limit(10)
.offset(ExclusiveStartKey)
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```

##### Count
```js
npd().table('chats')
.where('room_id', 'room1')
.count()
.then(function(data){
  console.log(data.Count);
})
.catch(function(err){
  console.err(err);
});
```

##### Extra options
You can set extra options in callback of `feature` method. All options are transformed from property to method, But its name (camelized) and arguments are same as pure AWS-SDK for node.js.

```js
npd().table('users')
.where('name', 'tonny')
.feature(function(f){ // f is raw feature object.
  f.consistentRead(true);
  f.returnConsumedCapacity('TOTAL');
})
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```

##### create (Make Overwrite all of values, if key[s] have already existed.)
```js
npd().table('users')
.create({ // Also can save collection.
  id: 2,
  name: 'rhodes',
  company: {
    name: 'Stark Industry',
    tel: '123456789',
    zip: '123456789',
    address: 'foo-bar-123'
  }
})
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```

##### Update
```js
npd().table('users')
.set("company", "PUT", {
  name: 'moved company',
  tel: '123-456-789',
  zip: '123-456-789',
  address: 'foo-bar-456'
})
.set("suite_color", "ADD", 1)
.update()
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```


##### Update with expressions
```js
npd().table('users')
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
.update()
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});

```

## Usage of ORM

Initialization
```js
var npdynamodb = require('npdynamodb');
var AWS = require('aws-sdk');

var npd = npdynamodb.createClient(new AWS.DynamoDB({
  apiVersion: '2012-08-10'
}));

var Chat = npdynamodb.define('chats', {
  npdynamodb: npd,

  hashKey: 'id',

  rangeKey: 'timestamp'
});
```

##### Fast get with hash_key
```js
Chat.find(1).then(function(chat){  // where('id', '=', 1)
  // Get value of id key
  console.log(chat.get('id'));

  // Get attribute keys
  console.log(chat.keys());

  // Get attribute values
  console.log(chat.values());

  // Pick specified key and value pairs
  console.log(chat.pick('chat_id', 'timestamp'));

  // Transform as json string.
  console.log(chat.toJson());
});
```

##### fetch with multiple conditions
```js
Chat.where('id', 1)
// complex conditions
.query(function(qb){
  qb.whereBeteen('timestamp', 1429212102, 1429212202);
})
.fetch()
.then(function(data){

  // Check query result is empty?
  console.log(data.isEmpty());
  // => false

  // Get First Item
  console.log(data.first().get('id'));
  // => 1

  // Get Last Item
  console.log(data.last().get('id'));
  // => 1

  // Seequence(Also supported map, find, etc....)
  data.each(function(item){
    console.log(item.get('id'));
  });

  // Pluck specific column values.
  console.log(data.pluck('id'));

  // Get as object.
  console.log(data.toArray());
  // => [{id: 1, name: 'tonny', company: {....}}]

});
```

##### Save
```js
// As Static
Chat.save({
  room_id: 'room1',
  ....
})
.then(function(chat){
  console.log(chat.get('room_id'));
});

// As Instance
var chat = new Chat({
  room_id: 'room1',
  user_id: 1
});
chat.set('message', 'This is a message.');

chat.save()
.then(function(chat){
  console.log(chat.get('room_id'));
});
```

##### Destroy
```js
chat.destroy()
.then(function(data){
  console.log(data);
});
```

##### Custom Methods and Properties
```js
var Chat = npdynamodb.define('chats', {
  npdynamodb: npd,

  hashKey: 'id',

  rangeKey: 'timestamp',

  customProtoTypeConstant: 1,

  customProtoTypeMethod: function(){
    return this.get('id') === 1;
  }

},

{
  customStaticConstant: 1,

  customStaticMethod: function(){
    return this.where('room_id', 'room1')
      .query(function(qb){
        qb.filter('timestamp', '>', 1429212102);
      })
      .fetch();
  }
});

// prototype
Chat.find(1).then(function(chat){
  console.log(chat.customProtoTypeConstant);
  console.log(chat.customeProtoTypeMethod());
});


// static
console.log(Chat.customStaticConstant);

Chat.customStaticMethod().then(function(data){
  console.log(data);
});
```

## Migration
We support schema migration for Dynamodb.

##### First, initialize your project to run migration.
```sh
npm install -g npdynamodb
# cd /path/to/your/project
npd init
# created npdfile.js
```

##### npdfile.js
```js
'use strict';

var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: "AWS_KEY",
  secretAccessKey: "AWS_SECRET",
  region: "ap-northeast-1"
});

module.exports = {

  // Specify migration file path. Default is `./migrations`
  // migration: {
  //  migrationFilePath: './npdynamodb_migrations'
  // },

  development: {
    dynamoClient: dynamodb,
    migrations: {
      ProvisionedThroughput: [10, 10],
      tableName: 'npd_migrations'
    }
  },

  staging: {
    dynamoClient: dynamodb,
    migrations: {
      ProvisionedThroughput: [10, 10],
      tableName: 'npd_migrations'
    }
  },

  production: {
    dynamoClient: dynamodb,
    migrations: {
      ProvisionedThroughput: [10, 10],
      tableName: 'npd_migrations'
    }
  }
};
```

##### Generate migration file.
```sh
npd migrate:generate create_users
# => /migrations/20150406083039_create_users.js
```

##### Edit migration file
```js
exports.up = function(migrator){
  return migrator().createTable('chats', function(t){
    t.string('room_id').hashKey();
    t.number('timestamp').rangeKey();
    t.provisionedThroughput(100, 100); // read, write

    t.globalSecondaryIndex('indexName1', function(t){
      t.string('user_id').hashKey();
      t.provisionedThroughput(100, 100); // read, write
      t.projectionTypeAll(); //default is NONE
    });

    t.localSecondaryIndex('indexName2', function(t){
      t.string('room_id').hashKey();
      t.number('user_id').rangeKey();
      t.projectionTypeAll(); //default is NONE
    });
  });
};

exports.down = function(migrator){
  return migrator().deleteTable('chats');
};
```

##### UpdateTable Usage
```js
exports.up = function(migrator, config){
  return migrator().updateTable('test_table1', function(t){
    t.globalSecondaryIndexUpdates(function(t){

      t.create('indexName3', function(t){
        t.string('hash_key2').hashKey();
        t.provisionedThroughput(100, 100);
        t.projectionTypeAll();
      });

      t.delete('indexName2');

      t.update('indexName1', function(t){
        t.provisionedThroughput(150, 100);
      });

      t.provisionedThroughput(200, 200);

    });
  }).then(function(){
    // wait until tables state will be ACTIVE.
    return migrator().waitUntilTableActivate('test_table1');
  });
};
```

##### Run latest migration.
```sh
npd migrate:run
```

##### Rollback latest migration.
```sh
npd migrate:rollback
```

## Command Line Interfaces
#### required global install and type `npd`
### Commands
* `init`: Create a fresh npdfile.js.
* `migrate:generate <name>` Create a named migration file.
* `migrate:run` Run all migrations that have not yet been run.
* `migrate:rollback` Rollback the last set of migrations performed.
* `listTables` List existing tables.
* `dump <table>`: Dump amount of records in specified table to stdout.
* `desc <table>`: Show result of the describe operation
* `get <table> <hashKey> [rangeKey]`: Show results of the query operation by given conditions.
* `dropTable <table>`: Drop the specified table.

### Global Options
* `-h`
* `-V`
* `--env`

## How to test?
```sh
npm test
```

## QueryBuilder Callbacks
You can be hooked several events and their can be taken promise.

Mechanism of Callbacks and Events
```
operation called.
      ↓
callbacks: beforeQuery
      ↓
events: beforeQuery
      ↓
Sending Request to Dynamodb
      ↓
Getting Response from Dynamodb
      ↓
callbacks: afterQuery
      ↓
events: afterQuery
```

```js
// Register callbacks globally
var npd = npdynamodb.createClient(dynamodb, {
  initialize: function(){
    this.callbacks('beforeQuery', function(){
      if(this._fature.params['hash_key'] !== 1) {
        return Promise.reject(new Error('invalid value'));
      }
    });

    this.callbacks('afterQuery', function(result){
      return npd().table('related').create({
        foo_id: result.Items[0]['hash_key'],
        bar: 'string value'
      });
    });
  }
});

// Register callbacks at only this time.
npd().table('foo').callbacks('beforeQuery', Func).create({
  hoo: 'hoo',
  bar: 'bar'
});
```

## Plugin and Extending
Npdynamodb can be extended via plugins.

```js
npdynamodb.plugin(function(Klass){

  // Extend QueryBuilder
  Klass.QueryBuilder.extend({
    protoFn: function(){
      console.log('foo');
    }
  },
  {
    staticFn: function(){
      console.log('bar');
    }
  });

  // Extend Orm Collection
  Klass.Collection.extend({
    protoFn: function(){
      console.log('foo');
    }
  },
  {
    staticFn: function(){
      console.log('bar');
    }
  });

  // Extend Orm Model
  Klass.Model.extend({
    protoFn: function(){
      console.log('foo');
    }
  },
  {
    staticFn: function(){
      console.log('bar');
    }
  });

});
```

### Available Plugins
* [npdynamodb-typecast](https://github.com/noppoMan/npdynamodb-typecast) For casting hash and range key to actual attribution type

## Browser Support
Npdynamodb can be built using browserify or webpack, and pre-built or pre-built with uglified version can be found in the build directory.

### For Browserify or Webpack
```js
var AWS = require('aws-sdk');
var npdynamodb = require('npdynamodb/build/npdynamodb');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: "here is key",
  secretAccessKey: "here is secret key",
  region: "ap-northeast-1",
  sslEnabled: true,
});

var npd = npdynamodb.createClient(dynamodb);
npd().table('table_name').where('id', 1).then(function(data){
  console.log(data);
});
```

### For HTML
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.1.39/aws-sdk.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bluebird/2.9.33/bluebird.min.js"></script>
<script src="../build/npdynamodb.min.js"></script>
<script>
  var dynamodb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    accessKeyId: "here is key",
    secretAccessKey: "here is secret key",
    region: "ap-northeast-1",
    sslEnabled: true,
  });

  var npd = npdynamodb.createClient(dynamodb);
  npd().table('table_name').where('id', 1).then(function(data){
    console.log(data);
  });
</script>
```

## Upgrading and Release Note
#### Upgrading 0.1x -> 0.2x

##### QueryBuilder
There should be a minor change for QueryBuilder. 0.2x  QueryBuilder can take options as second argument of createClient.
* 0.2.0: `timeout` option supported.
* 0.2.6: `initialize` option and [callbacks](#querybuilder-callbacks) supported.
* 0.2.7: [whereIn](wherein) method supported.

##### ORM
There should be a major change for ORM. 0.2x ORM constructor need to pass the npdynamodb instance instead of pure dynamodb instance.
* 0.2.7: Supported to parse `whereIn` results.

## License

(The MIT License)

Copyright (c) 2015 Yuki Takei(Noppoman) yuki@miketokyo.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and marthis permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
