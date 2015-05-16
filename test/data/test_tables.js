'use strict';

exports.compex_table = {
  AttributeDefinitions: [
    { AttributeName: 'hash_key', AttributeType: 'S' },
    { AttributeName: 'range_key', AttributeType: 'N' },
    { AttributeName: 'gsi_hash_key', AttributeType: 'S' },
    { AttributeName: 'lsi_range_key', AttributeType: 'N' }
  ],
  KeySchema: [
    { AttributeName: 'hash_key', KeyType: 'HASH' },
    { AttributeName: 'range_key', KeyType: 'RANGE' }
  ],
  TableName: 'complex_table',
  ProvisionedThroughput: {
    ReadCapacityUnits: 100, WriteCapacityUnits: 100
  },
  GlobalSecondaryIndexes: [
    {
      KeySchema: [
        { AttributeName: 'gsi_hash_key', KeyType: 'HASH' }
      ],
      IndexName: 'indexName1',
      ProvisionedThroughput: { ReadCapacityUnits: 100, WriteCapacityUnits: 100 },
      Projection: { ProjectionType: 'ALL' }
    }
  ],
  LocalSecondaryIndexes: [
    {
      KeySchema: [
        { AttributeName: 'hash_key', KeyType: 'HASH' },
        { AttributeName: 'lsi_range_key', KeyType: 'RANGE' }
      ],
      IndexName: 'indexName2',
      Projection: { ProjectionType: 'ALL' }
    }
  ]
};


exports.chats = {
  AttributeDefinitions: [
    { AttributeName: 'room_id', AttributeType: 'S' },
    { AttributeName: 'timestamp', AttributeType: 'N' },
  ],
  KeySchema: [
    { AttributeName: 'room_id', KeyType: 'HASH' },
    { AttributeName: 'timestamp', KeyType: 'RANGE' }
  ],
  TableName: 'chats',
  ProvisionedThroughput: {
    ReadCapacityUnits: 100, WriteCapacityUnits: 100
  },
};

exports.for_schema_test = {
  AttributeDefinitions: [
    { AttributeName: 'hash_key', AttributeType: 'S' },
    { AttributeName: 'range_key', AttributeType: 'B' },
    { AttributeName: 'gsi_hash_key', AttributeType: 'S' },
    { AttributeName: 'gsi_hash_key2', AttributeType: 'N' },
    { AttributeName: 'gsi_hash_key3', AttributeType: 'B' },
    { AttributeName: 'lsi_range_key', AttributeType: 'N' },
    { AttributeName: 'lsi_range_key2', AttributeType: 'S' },
    { AttributeName: 'lsi_range_key3', AttributeType: 'B' }
  ],
  KeySchema: [
    { AttributeName: 'hash_key', KeyType: 'HASH' },
    { AttributeName: 'range_key', KeyType: 'RANGE' }
  ],
  TableName: 'complex_table',
  ProvisionedThroughput: { ReadCapacityUnits: 100, WriteCapacityUnits: 100 },
  GlobalSecondaryIndexes: [
    {
      KeySchema: [
        { AttributeName: 'gsi_hash_key', KeyType: 'HASH' }
      ],
      IndexName: 'indexName1',
      ProvisionedThroughput: { ReadCapacityUnits: 100, WriteCapacityUnits: 100 },
      Projection: { ProjectionType: 'ALL' }
    },
    {
      KeySchema: [
        { AttributeName: 'gsi_hash_key2', KeyType: 'HASH' }
      ],
      IndexName: 'indexName2',
      ProvisionedThroughput: { ReadCapacityUnits: 100, WriteCapacityUnits: 100 },
      Projection: { ProjectionType: 'ALL' }
    },
    {
      KeySchema: [
        { AttributeName: 'gsi_hash_key3', KeyType: 'HASH' }
      ],
      IndexName: 'indexName3',
      ProvisionedThroughput: { ReadCapacityUnits: 100, WriteCapacityUnits: 100 },
      Projection: { ProjectionType: 'ALL' }
    }
  ],
  LocalSecondaryIndexes: [
    {
      KeySchema: [
        { AttributeName: 'hash_key', KeyType: 'HASH' },
        { AttributeName: 'lsi_range_key', KeyType: 'RANGE' }
      ],
      IndexName: 'indexName4',
      Projection: { ProjectionType: 'ALL' }
    },
    {
      KeySchema: [
        { AttributeName: 'hash_key', KeyType: 'HASH' },
        { AttributeName: 'lsi_range_key2', KeyType: 'RANGE' }
      ],
      IndexName: 'indexName5',
      Projection: { ProjectionType: 'ALL' }
    },
    {
      KeySchema: [
        { AttributeName: 'hash_key', KeyType: 'HASH' },
        { AttributeName: 'lsi_range_key3', KeyType: 'RANGE' }
      ],
      IndexName: 'indexName6',
      Projection: { ProjectionType: 'ALL' }
    }
  ]
};
