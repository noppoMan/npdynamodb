'use strict';

var AWS = require('aws-sdk');

module.exports = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: process.env['DYNAMO_KEY'] || "AWS_KEY",
  secretAccessKey: process.env['DYNAMO_SECRET_KEY'] || "AWS_SECRET",
  region: process.env['AWS_REGION'] || "ap-northeast-1",
  sslEnabled: false,
  endpoint: process.env['DYNAMO_ENDPOINT'] || 'localhost:8000'
});
