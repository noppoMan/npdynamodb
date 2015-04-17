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
}


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
}
