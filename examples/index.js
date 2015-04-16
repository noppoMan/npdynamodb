var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: process.env['DYNAMO_KEY'] || "AWS_KEY",
  secretAccessKey: process.env['DYNAMO_SECRET_KEY'] || "AWS_SECRET",
  region: process.env['AWS_REGION'] || "ap-northeast-1",
  sslEnabled: false,
  endpoint: process.env['DYNAMO_ENDPOINT'] || 'localhost:8000'
});

var npdynamodb = require('../index');
var npd = npdynamodb.createClient(dynamodb);

var tableName = 'cc-chat_index-development';

npdynamodb.defineSchema(tableName, function(t){
  t.string('chat_id').hashKey();
  t.number('datetime_begin');
  t.number('datetime_end');
});

npd()
.table(tableName)
.save({
  chat_id: '123',
  datetime_begin: 123,
  datetime_end: 123
})
.then(function(data){

  console.log('Created!!!');

  return npd()
    .table(tableName)
    .where('chat_id', '123')
    .then(function(data){
      console.log('fetch items');
      console.log(data);
    });
})
.then(function(){
  return npd()
  .table(tableName)
  .where('chat_id', '123')
  .count()
  .then(function(data){
    console.log('count ' + data.toString());
  });
})
.then(function(){
  return npd()
  .table(tableName)
  .where('chat_id', '123')
  .delete()
  .then(function(){
    console.log('Deleted!');
  });
})
.catch(function(err){
  console.error(err);
})

npd()
.table(tableName)
.describe()
.then(function(data){
  console.log(data);
});

npd().showTables()
.then(function(data){
  console.log(data);
});
