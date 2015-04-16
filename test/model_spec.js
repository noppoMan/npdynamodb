var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: process.env['DYNAMO_KEY'] || "AWS_KEY",
  secretAccessKey: process.env['DYNAMO_SECRET_KEY'] || "AWS_SECRET",
  region: process.env['AWS_REGION'] || "ap-northeast-1",
  sslEnabled: false,
  endpoint: process.env['DYNAMO_ENDPOINT'] || 'localhost:8000'
});

var npd = npdynamodb.createClient(dynamodb);

var complexTable = npdynamodb.define('complex_table', {
  hashKey: 'hash_key',
  rangeKey: 'range_key',
  dynamodb: dynamodb
});

complexTable()
.find('key1')
.then(function(data){
  console.log(data);
});
