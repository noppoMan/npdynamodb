# npdynamodb
A Simple and Fast Node.js ORM for AWS DynamoDB.

## Motivation
When I visited [here ](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property
) for the first time, I closed this page in a moment.
Because it is too long and hard to see to understand. Especially people who are not in English-speaking world.
After that I decided to not involve with DynamoDB at Node.js Project.
But After a while, Fortunately or unfortunately I faced time to use DynamoDB with Node.js again and There was no escape way.
So I decided to develop client to handle it more easier and It doesn't take waste of time to read documentation.
Now I think this opportunity is chance to be good friend with it.  
My fighting has started.

## Supported Api Versions
* 2012-08-10

## Installation
(Not published yet.)
```sh
npm install npdynamodb
```

## Why is the Pure AWS-SDK in Node.js NOT good?

Parameters are like Chant of the magic.
[http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)

## Usage
Npdynamodb has two faces. One is Simple Query Builder and the other is Light ORM.
We release you redundancy codes and see simple syntax.  
of course, will not see callback hell !!

## Use as QueryBuilder

Initialization
```js
var npdynamodb = require('npdynamodb');
var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

var npd = npdynamodb.createClient(dynamodb);
```

##### Read Example
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

##### Count
```js
npd().table('users')
.where('name', 'tonny')
.count()
.then(function(data){
  console.log(data);
})
.catch(function(err){
  console.err(err);
});
```

##### With Feature
```js
npd().table('users')
.where('name', 'tonny')
.feature(function(f){
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

##### save(Make Overwrite values, if key has already existed.)
```js
npd().table('users')
.save({
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

## Use as ORM

```js

var Chat = npd.define('chat', {
  hashKey: 'id',

  rangeKey: 'timestamp'

  timestamps: true,
});

// Fast get with hash_key
Chat.find(1).then(function(chat){  // where('id', '=', 1)
  console.log(chat.get('id'));
});

Chat.query(function(qb){
  qb.where('id', 1).whereBeteen('timestamp', 1429212102, 1429212202);
})
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

  // Get as raw json
  console.log(data.attributes());
  // => [{id: 1, name: 'tonny', company: {....}}]

});
```

## QueryBuilder Apis
* createTable
* deleteTable
* alterTable
* all
* then
* count
* save
* delete
* describe
* showTables
* waitFor
* import

##### Where
* where
* whereBetween
* whereBeginsWith

##### Filter
* filter
* filterBetween
* filterIn
* filterBeginsWith
* filterContains
* filterNotContains
* filterNull
* filterNotNull


##### Other conditions
* select :alias of `attributesToGet(['attr1', 'attr2'])`
* table
* indexName
* descending :alias of `scanIndexForward(true)`
* limit


##### feature methods (2012-08-10)
* requestItems
* returnConsumedCapacity
* returnItemCollectionMetrics
* attributeDefinitions
* tableName
* keySchema
* localSecondaryIndexes
* globalSecondaryIndexes
* provisionedThroughput
* key
* expected
* conditionalOperator
* returnValues
* conditionExpression
* expressionAttributeNames
* expressionAttributeValues
* attributesToGet
* consistentRead
* projectionExpression
* exclusiveStartTableName
* item
* keyConditions
* queryFilter
* scanIndexForward
* exclusiveStartKey
* filterExpression
* scanFilter
* totalSegments
* segment
* attributeUpdates
* updateExpression
* globalSecondaryIndexUpdates

### Events
* `callbacks.beforeQuery`: Fired before sending request
* `callbacks.afterQuery`: Fired after getting response



## ORM Apis
* find
* all
* then
* save


#### ResultItemCollection
* each
* map
* reduce
* reduceRight
* find
* filter
* where
* findWhere
* reject
* every
* some
* contains
* invoke
* pluck
* max
* min
* sortBy
* groupBy
* indexBy
* countBy
* shuffle
* sample
* toArray
* size
* partition
* first
* last

#### ResultItem
* get


## Migration (Works in progress.)
We support schema migration with dynamodb.

##### First, initialize your project to run migration.
```sh
npd install -g npdynamodb
# cd /path/to/your/project
npd init
```

##### Generate migration file.
```sh
npd migrate:generate create_users
# => /migrations/20150406083039_create_users.js
```

##### Edit migration file
/migrations/20150406083039_create_users.js
```js
exports.up = function(migrator){
  return migrator().createTable('chats', function(t){
    t.string('room_id').hashKey();
    t.number('timestamp').rangeKey();
    t.provisionedThroughput(100, 100); // read, write

    t.globalSecandayIndex('indexName1', function(t){
      t.string('user_id').hashKey();
      t.provisionedThroughput(100, 100); // read, write
      t.ProjectionTypeAll(); //default is NONE
    });

    t.localSecandaryIndex('indexName2', function(t){
      t.string('room_id').hashKey();
      t.number('user_id').rangeKey();
      t.ProjectionTypeAll(); //default is NONE
    });
  });
}

exports.down = function(migrator){
  return migrator().deleteTable('chats');
}
```

##### Run migration.
```sh
npd migrate:run
```

##### Rollback migration.
```sh
npd migrate:rollback
```

## Command Line Interfaces
* `init` Initialize project to run migration.
* `migrate:*` Commands for migration.
* `listTables` List existing tables.

## How to test?
```sh
npm test
```
