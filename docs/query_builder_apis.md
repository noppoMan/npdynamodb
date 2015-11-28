#  QueryBuilder Apis

##### Options
* timeout: default is 5000(ms)
* initialize

##### Operations
* createTable
* deleteTable
* all
* count
* create
* update
* delete
* describe
* showTables
* feature
* rawClient: Return promisified AWS.DynamoDB
* freshBuilder: Getting fresh QueryBuilder instance with extending same options.

##### Where
* where
* whereIn: Using batchGetItem
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
* select :alias of `feature.attributesToGet(['attr1', 'attr2'])`
* table
* indexName
* asc :alias of `feature.scanIndexForward(true)`
* desc :alias of `feature.scanIndexForward(false)`
* limit
* offset: alias of `feature.exclusiveStartKey(Object)`


##### feature methods (2012-08-10)
* requestItems
* returnConsumedCapacity
* returnItemCollectionMetrics
* attributeDefinitions
* tableName
* keySchema
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

### Events
* `beforeQuery`: Fired before sending request
* `afterQuery`: Fired after getting response

### Callbacks
* `beforeQuery`: Executed before sending request
* `afterQuery`: Executed after getting response
