(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"), require("aws-sdk"), require("bluebird"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash", "aws-sdk", "bluebird"], factory);
	else if(typeof exports === 'object')
		exports["npdynamodb"] = factory(require("lodash"), require("aws-sdk"), require("bluebird"));
	else
		root["npdynamodb"] = factory(root["_"], root["AWS"], root["Promise"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_10__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);

	// For Browser
	if(typeof(window) === 'object') {
	  window.npdynamodb = exports;
	  window.DynamoDBDatatype = __webpack_require__(3).DynamoDBDatatype;
	  window.DynamoDBFormatter = __webpack_require__(5).DynamoDBFormatter;
	}

	exports.version = __webpack_require__(6).version;

	exports.createClient = __webpack_require__(7);

	exports.define = __webpack_require__(27);

	exports.Migrator = __webpack_require__(1);

	var QueryBuilder = __webpack_require__(8),
	  Collection = __webpack_require__(29),
	  Model = __webpack_require__(28)
	;

	[QueryBuilder, Collection, Model].forEach(function(Klass){
	  Klass.extend = function(protoProps, staticProps){
	    _.extend(Klass.prototype, protoProps || {});
	    _.extend(Klass, staticProps || {});
	  };
	});

	exports.plugin = function(pluginFn){
	  if(typeof pluginFn !== 'function') {
	    throw new Error('The plugin must be function.');
	  }
	  pluginFn({
	    QueryBuilder: QueryBuilder,
	    Collection: Collection,
	    Model: Model
	  });
	};

	/*******  TODO Will be duplicated in 0.3.x *******/

	exports.Collection = __webpack_require__(29);

	exports.Model = __webpack_require__(28);

	/*******  TODO Will be duplicated in 0.3.x *******/


/***/ },
/* 1 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * @class Creates a DynamoDBDatatype that takes care of all datatype handling.
	 *
	 * @name DynamoDBDatatype
	 */
	function DynamoDBDatatype() {
	    var AWS = typeof(window) === "undefined" ? __webpack_require__(4) : window.AWS;
	    var Uint8ArrayError = "Uint8Array can only be used for Binary in Browser.";
	    var ScalarDatatypeError = "Unrecognized Scalar Datatype to be formatted.";
	    var GeneralDatatypeError = "Unrecognized Datatype to be formatted.";
	    var BinConversionError = "Need to pass in Buffer or Uint8Array. ";
	    var StrConversionError = "Need to pass in string primitive to be converted to binary.";

	    function isScalarType(dataType) {

	        var type = typeof(dataType);
	        return  type === "number"  ||
	                type === "string"  ||
	                type === "boolean" ||
	                (dataType instanceof(Uint8Array) && AWS.util.isBrowser()) ||
	                dataType instanceof(AWS.util.Buffer) ||
	                dataType === null;
	    }

	    function isSetType(dataType) {
	        return dataType.datatype === "SS" ||
	                dataType.datatype === "NS" ||
	                dataType.datatype === "BS";
	    }

	    function isRecursiveType(dataType) {

	        return Array.isArray(dataType) ||
	                typeof(dataType) === "object";
	    }

	    function formatSetValues(datatype, values) {
	        if(datatype === "NS") {
	            return values.map(function (n) {
	                return n.toString();
	            });
	        } else {
	          return values;
	        }
	    };

	    function formatRecursiveType(dataType) {

	        var recursiveDoc = {};

	        var value = {};
	        var type = "M";
	        if (Array.isArray(dataType)) {
	            value = [];
	            type = "L";
	        }

	        for (var key in dataType) {
	            value[key] = this.formatDataType(dataType[key]);
	        }

	        recursiveDoc[type] = value;
	        return recursiveDoc;
	    }

	    /** @throws Uint8ArrayError, ScalarDatatypeError
	     *  @private */
	    function formatScalarType(dataType) {

	        if (dataType == null) {
	            return { "NULL" : true };
	        }

	        var type = typeof(dataType);
	        if (type === "string") {
	            return { "S" : dataType };
	        } else if (type === "number") {
	            return { "N" : String(dataType) };
	        } else if (type === "boolean") {
	            return { "BOOL" : dataType };
	        } else if (dataType instanceof(AWS.util.Buffer)) {
	            return { "B" : dataType };
	        } else if (dataType instanceof(Uint8Array)) {
	            if (AWS.util.isBrowser()) {
	                return { "B" : dataType };
	            } else {
	                throw new Error(Uint8ArrayError);
	            }
	        } else {
	            throw new Error(ScalarDatatypeError);
	        }
	    }

	    /**
	     * Formats Javascript datatypes into DynamoDB wire format.
	     *
	     * @name formatDataType
	     * @function
	     * @memberOf DynamoDBDatatype#
	     * @param dataType Javascript datatype (i.e. string, number. For full information, check out the README).
	     * @return {object} DynamoDB JSON-like wire format.
	     * @throws GeneralDatatypeError
	     */
	    this.formatDataType = function(dataType) {

	        if (isScalarType(dataType)) {
	            return formatScalarType(dataType);
	        } else if (isSetType(dataType)) {
	            return dataType.format();
	        } else if (isRecursiveType(dataType)) {
	            return formatRecursiveType.call(this, dataType);
	        }  else {
	            throw new Error(GeneralDatatypeError);
	        }

	    };

	    function str2Bin(value) {
	        if (typeof(value) !== "string") {
	            throw new Error(StrConversionError);
	        }

	        if (AWS.util.isBrowser()) {
	            var len = value.length;
	            var bin = new Uint8Array(new ArrayBuffer(len));
	            for (var i = 0; i < len; i++) {
	                bin[i] = value.charCodeAt(i);
	            }
	            return bin;
	        } else {
	            return AWS.util.Buffer(value);
	        }
	    }

	    /**
	     * Utility to convert a String to a Binary object.
	     *
	     * @function strToBin
	     * @memberOf DynamoDBDatatype#
	     * @param {string} value String value to converted to Binary object.
	     * @return {object} (Buffer | Uint8Array) depending on Node or browser.
	     * @throws StrConversionError
	     */
	    this.strToBin = function(value) {
	        return str2Bin.call(this, value);
	    };

	    function bin2Str(value) {
	        if (!(value instanceof(AWS.util.Buffer)) && !(value instanceof(Uint8Array))) {
	            throw new Error(BinConversionError);
	        }

	        if (AWS.util.isBrowser()) {
	            return String.fromCharCode.apply(null, value);
	        } else {
	            return value.toString("utf-8").valueOf();
	        }
	    }

	    /**
	     * Utility to convert a Binary object into a decoded String.
	     *
	     * @function binToStr
	     * @memberOf DynamoDBDatatype#
	     * @param {object} value Binary value (Buffer | Uint8Array) depending on Node or browser.
	     * @return {string} decoded String in UTF-8
	     * @throws BinConversionError
	     */
	    this.binToStr = function(value) {
	        return bin2Str.call(this, value);
	    };

	    /**
	     * Utility to create the DynamoDB Set Datatype.
	     *
	     * @function createSet
	     * @memberOf DynamoDBDatatype#
	     * @param {array} set An array that contains elements of the same typed as defined by {type}.
	     * @param {string} type Can only be a [S]tring, [N]umber, or [B]inary type.
	     * @return {Set} Custom Set object that follow {type}.
	     * @throws InvalidSetType, InconsistentType
	     */
	    this.createSet = function(set, type) {
	        if (type !== "N" && type !== "S" && type !== "B") {
	            throw new Error(type + " is an invalid type for Set");
	        }

	        var setObj = function Set(set, type) {
	            this.datatype = type + "S";
	            this.contents = {};

	            this.add = function(value) {
	                if (this.datatype === "SS" && typeof(value) === "string") {
	                    this.contents[value] = value;
	                } else if (this.datatype === "NS" && typeof(value) === "number") {
	                    this.contents[value] = value;
	                } else if (this.datatype === "BS" && value instanceof(AWS.util.Buffer)) {
	                    this.contents[bin2Str(value)] = value;
	                } else if (this.datatype === "BS" && value instanceof(Uint8Array)) {
	                    if (AWS.util.isBrowser()) {
	                        this.contents[bin2Str(value)] = value;
	                    } else {
	                        throw new Error(Uint8ArrayError);
	                    }
	                } else {
	                    throw new Error("Inconsistent in this " + type + " Set");
	                }
	            };

	            this.contains = function(content) {
	                var value = content;
	                if (content instanceof AWS.util.Buffer || content instanceof(Uint8Array)) {
	                    value = bin2Str(content);
	                }
	                if (this.contents[value] === undefined) {
	                    return false;
	                }
	                return true;
	            };

	            this.remove = function(content) {
	                var value = content;
	                if (content instanceof AWS.util.Buffer || content instanceof(Uint8Array)) {
	                    value = bin2Str(content);
	                }
	                delete this.contents[value];
	            };

	            this.toArray = function() {
	                var keys = Object.keys(this.contents);
	                var arr = [];

	                for (var keyIndex in keys) {
	                    var key = keys[keyIndex];
	                    if (this.contents.hasOwnProperty(key)) {
	                        arr.push(this.contents[key]);
	                    }
	                }

	                return arr;
	            };

	            this.format = function() {
	                var values = this.toArray();
	                var result = {};
	                result[this.datatype] = formatSetValues(this.datatype, values);
	                return result;
	            };

	            if (set) {
	                for (var index in set) {
	                    this.add(set[index]);
	                }
	            }
	        };

	        return new setObj(set, type);
	    };

	    /**
	     * Formats DynamoDB wire format into javascript datatypes.
	     *
	     * @name formatWireType
	     * @function
	     * @memberOf DynamoDBDatatype#
	     * @param {string} key Key that represents the type of the attribute value
	     * @param value Javascript datatype of the attribute value produced by DynamoDB
	     * @throws GeneralDatatypeError
	     */
	    this.formatWireType = function(key, value) {
	        switch (key) {
	            case "S":
	            case "B":
	            case "BOOL":
	                return value;
	            case "N":
	                return Number(value);
	            case "NULL":
	                return null;
	            case "L":
	                for (var lIndex = 0; lIndex < value.length; lIndex++) {
	                    var lValue = value[lIndex];
	                    var lKey = Object.keys(lValue)[0];
	                    value[lIndex] = this.formatWireType(lKey, lValue[lKey]);
	                }
	                return value;
	            case "M":
	                for (var mIndex in value) {
	                    var mValue = value[mIndex];
	                    var mKey = Object.keys(mValue)[0];
	                    value[mIndex] = this.formatWireType(mKey, mValue[mKey]);
	                }
	                return value;
	            case "SS":
	                return new this.createSet(value, "S");
	            case "NS":
	                value = value.map(function(each) { return Number(each);});
	                return new this.createSet(value, "N");
	            case "BS":
	                return new this.createSet(value, "B");
	            default:
	                throw "Service returned unrecognized datatype " + key;
	        }
	    }
	}

	if (true) {
	    var exports = module.exports = {};
	    exports.DynamoDBDatatype = DynamoDBDatatype;
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 *  Create an instance of the DynamoDBFormatter.
	 *  @constructor
	 *  @return {DynamoDBFormatter} A Formatter object that provides methods for formatting DynamoDB requests and responses.
	 */
	function DynamoDBFormatter() {
	    var datatypes = typeof(window) === "undefined" ? __webpack_require__(3).DynamoDBDatatype : window.DynamoDBDatatype;
	    var t = new datatypes();
	    var EmptyConditionArray = "Need to pass in an array with 1 or more Condition Objects.";
	    var BadElementInConditionArray = "Only Condition objects are allowed as members of the array.";
	    var InvalidCondition = "Need to pass in a valid Condition Object.";

	    function formatAttrValInput(attrValueMap) {
	        var attributeValueMap = {};
	        for (var attr in attrValueMap) {
	            var value = attrValueMap[attr];
	            attributeValueMap[attr] = t.formatDataType(value);
	        }
	        return attributeValueMap;
	    }

	    function formatConditions(conditions) {
	        if (conditions.prototype && conditions.prototype.instanceOf === "DynamoDBConditionObject") {
	            conditions = [conditions];
	        } else {
	            if (Array.isArray(conditions)) {
	                if (conditions.length === 0) {
	                    throw new Error(EmptyConditionArray);
	                }
	                for (var index in conditions) {
	                    var condition = conditions[index];
	                    if (!(condition.prototype) || !(condition.prototype.instanceOf === "DynamoDBConditionObject")) {
	                        throw new Error(BadElementInConditionArray);
	                    }
	                }
	            } else {
	                throw new Error(InvalidCondition);
	            }
	        }

	        var expected = {};
	        for (var index in conditions) {
	            var condition = conditions[index];
	            expected[condition.key] = condition.format();
	        }
	        return expected;
	    }

	    function formatUpdates(updates) {
	        var attrUpdates = {};
	        for (var attr in updates) {
	            if (updates.hasOwnProperty(attr)) {
	                var actionValue = {};
	                var value = updates[attr].Value;
	                var action = updates[attr].Action;

	                actionValue.Action = action;
	                actionValue.Value = t.formatDataType(value);

	                attrUpdates[attr] = actionValue;
	            }
	        }

	         return attrUpdates;
	    }

	    function handleWriteRequest(request) {
	        var requestCopy = {};

	        if (request.DeleteRequest) {
	            var key = request.DeleteRequest.Key;
	            requestCopy.DeleteRequest = {};
	            requestCopy.DeleteRequest.Key = formatAttrValInput(key);
	        } else {
	            var item = request.PutRequest.Item;
	            requestCopy.PutRequest = {};
	            requestCopy.PutRequest.Item = formatAttrValInput(item);
	        }

	        return requestCopy;
	    }

	    function formatRequestItems(requests) {
	        var requestItems = {};

	        for (var table in requests) {
	            if (requests.hasOwnProperty(table)) {
	                requestItems[table] = {};

	                var request = requests[table];
	                if (Array.isArray(request)) {
	                    var writeRequests = [];
	                    for (var wIndex in request) {
	                        writeRequests.push(handleWriteRequest(request[wIndex]));
	                    }
	                    requestItems[table] = writeRequests;
	                } else {
	                    if (request.AttributesToGet) {
	                        requestItems[table].AttributesToGet = request.AttributesToGet;
	                    }
	                    if (request.ConsistentRead) {
	                        requestItems[table].ConsistentRead = request.ConsistentRead;
	                    }
	                    if (request.ProjectionExpression) {
	                        requestItems[table].ProjectionExpression = request.ProjectionExpression;
	                    }
	                    if (request.ExpressionAttributeNames) {
	                        requestItems[table].ExpressionAttributeNames = request.ExpressionAttributeNames;
	                    }
	                    if (request.Keys) {
	                        var keys = [];
	                        for (var gIndex in request.Keys) {
	                            var key = request.Keys[gIndex];
	                            keys.push(formatAttrValInput(key));
	                        }
	                        requestItems[table].Keys = keys;
	                    }
	                }
	            }
	        }

	        return requestItems;
	    }

	    var inputMap = { "AttributeUpdates": formatUpdates,
	                     "ExclusiveStartKey": formatAttrValInput,
	                     "Expected": formatConditions,
	                     "ExpressionAttributeValues": formatAttrValInput,
	                     "Item": formatAttrValInput,
	                     "Key": formatAttrValInput,
	                     "KeyConditions": formatConditions,
	                     "RequestItems": formatRequestItems,
	                     "ScanFilter": formatConditions,
	                     "QueryFilter": formatConditions};


	    function formatAttrValOutput(item) {
	        var attrList = {};
	        for (var attribute in item) {
	            var keys = Object.keys(item[attribute]);
	            var key = keys[0];
	            var value = item[attribute][key];

	            value = t.formatWireType(key, value);
	            attrList[attribute] = value;
	        }

	        return attrList;
	    }

	    function formatItems(items) {
	        for (var index in items) {
	            items[index] = formatAttrValOutput(items[index]);
	        }
	        return items;
	    }

	    function handleCollectionKey(metrics) {
	        var collectionKey = metrics.ItemCollectionKey;
	        metrics.ItemCollectionKey = formatAttrValOutput(collectionKey);
	        return metrics;
	    }

	    function handleBatchMetrics(metrics) {
	        for (var table in metrics) {
	            if (metrics.hasOwnProperty(table)) {
	                var listOfKeys = metrics[table];
	                for (var index in listOfKeys) {
	                    listOfKeys[index] = handleCollectionKey(listOfKeys[index]);
	                }
	            }
	        }
	        return metrics;
	    }

	    function formatMetrics(metrics) {
	        var collectionKey = metrics.ItemCollectionKey;
	        if (collectionKey) {
	            metrics = handleCollectionKey(metrics);
	        } else {
	            metrics = handleBatchMetrics(metrics);
	        }
	        return metrics;
	    }

	    function formatResponses(responses) {
	        for (var table in responses) {
	            if (responses.hasOwnProperty(table)) {
	                var listOfItems = responses[table];
	                for (var index in listOfItems) {
	                    listOfItems[index] = formatAttrValOutput(listOfItems[index]);
	                }
	            }
	        }

	        return responses;
	    }

	    function formatUnprocessedItems(unprocessedItems) {
	        for(var table in unprocessedItems) {
	            if (unprocessedItems.hasOwnProperty(table)) {
	                var tableInfo = unprocessedItems[table];
	                for (var index in tableInfo) {
	                    var request = tableInfo[index];
	                    if (request.DeleteRequest) {
	                        tableInfo[index].DeleteRequest.Key = formatAttrValOutput(request.DeleteRequest.Key);
	                    } else {
	                        tableInfo[index].PutRequest.Item = formatAttrValOutput(request.PutRequest.Item);
	                    }
	                }
	            }
	        }
	        return unprocessedItems;
	    }

	    function formatUnprocessedKeys(unprocessedKeys) {
	        for (var table in unprocessedKeys) {
	            if (unprocessedKeys.hasOwnProperty(table)) {
	                var tableInfo = unprocessedKeys[table];
	                var listOfKeys = tableInfo.Keys;
	                for (var index in listOfKeys) {
	                    tableInfo.Keys[index] = formatAttrValOutput(listOfKeys[index]);
	                }
	            }
	        }

	        return unprocessedKeys;
	    }

	    /**
	     * DynamoDBFormatter specifically for wrapping DynamoDB response objects.
	     *
	     * @function formatOutput
	     * @memberOf DynamoDBFormatter#
	     * @params {object} response Response object directly passed out by the service.
	     * @returns {object} Wrapped up response object.
	     */
	    this.formatOutput = function(response) {
	        var outputMap = {"Attributes": formatAttrValOutput,
	                         "Item": formatAttrValOutput,
	                         "Items": formatItems,
	                         "ItemCollectionMetrics": formatMetrics,
	                         "LastEvaluatedKey": formatAttrValOutput,
	                         "Responses": formatResponses,
	                         "UnprocessedKeys": formatUnprocessedKeys,
	                         "UnprocessedItems": formatUnprocessedItems};


	        var data = response.data;
	        if (data) {
	            for (var key in data) {
	                if (data.hasOwnProperty(key)) {
	                    var formatFunc = outputMap[key];
	                    if (formatFunc) {
	                        response.data[key] = formatFunc(data[key]);
	                    }
	                }
	            }
	        }
	    };

	    /**
	     * DynamoDBFormatter specifically for unwrapping DynamoDB request objects.
	     *
	     * @function formatInput
	     * @memberOf DynamoDBFormatter#
	     * @params {object} request Request object created by the service.
	     * @return {object} Returns aws sdk version of the request.
	     */
	    this.formatInput = function (request) {
	        var paramsCopy = {};
	        var params = request.params;

	        for (var key in params) {
	            if (params.hasOwnProperty(key)) {
	                var param = params[key];
	                var formatFunc = inputMap[key];
	                if (formatFunc) {
	                    param = formatFunc(param);
	                }
	                paramsCopy[key] = param;
	            }
	        }

	        request.params = paramsCopy;
	    };
	}

	if (true) {
	    var exports = module.exports = {};
	    exports.DynamoDBFormatter = DynamoDBFormatter;
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {
		"name": "npdynamodb",
		"version": "0.2.11",
		"description": "A Node.js Simple Query Builder and ORM for AWS DynamoDB.",
		"main": "index.js",
		"scripts": {
			"test": "find ./test -name *_spec.js | xargs mocha --reporter spec -t 20000"
		},
		"keywords": [
			"dynamodb",
			"aws",
			"activerecord",
			"orm",
			"migration"
		],
		"bin": {
			"npd": "./lib/bin/npd"
		},
		"repository": {
			"type": "git",
			"url": "https://github.com/noppoMan/npdynamodb.git"
		},
		"author": "noppoMan <yuki@miketokyo.com> (http://miketokyo.com)",
		"license": "MIT",
		"bugs": {
			"url": "https://github.com/noppoMan/npdynamodb/issues"
		},
		"homepage": "https://github.com/noppoMan/npdynamodb",
		"dependencies": {
			"bluebird": "^2.9.24",
			"chalk": "^1.0.0",
			"commander": "^2.7.1",
			"dynamodb-doc": "^1.0.0",
			"glob": "^5.0.3",
			"interpret": "^0.5.2",
			"liftoff": "^2.0.3",
			"lodash": "^3.5.0",
			"minimist": "^1.1.1",
			"readline": "0.0.7",
			"v8flags": "^2.0.3"
		},
		"devDependencies": {
			"aws-sdk": "^2.1.18",
			"chai": "^2.2.0"
		},
		"browser": {
			"./lib/migrate/migrator.js": false,
			"./lib/dialects/2012-08-10/schema.js": false,
			"aws-sdk": false
		}
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var QueryBuilder = __webpack_require__(8);
	var promisify = __webpack_require__(25);
	var DOC = __webpack_require__(18);

	var promisifiedPool = {};

	function npdynamodb(clients, options){
	  var qb = new QueryBuilder(clients, options);
	  return qb;
	}

	module.exports = function(dynamodb, options){
	  var v = dynamodb.config.apiVersion,
	    api = __webpack_require__(26)("./" + v + '/' + 'api')
	  ;

	  if(!promisifiedPool[v]) {
	    promisifiedPool[v] = promisify(dynamodb, api.originalApis);
	  }

	  var clients = {
	    dynamodb: typeof dynamodb.Condition === 'function' ? dynamodb: new DOC.DynamoDB(dynamodb),
	    promisifidRawClient: promisifiedPool[v]
	  };

	  return function(){
	    return npdynamodb(clients, options);
	  };
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var interfaces = __webpack_require__(9);
	var _ = __webpack_require__(2);
	var Promise = __webpack_require__(10);
	var EventEmitter = __webpack_require__(11).EventEmitter;
	var util = __webpack_require__(12);

	var utils = __webpack_require__(16);

	var Features = {
	  '2012-08-10': __webpack_require__(17)
	};

	module.exports = QueryBuilder;

	function QueryBuilder(clients, options){
	  EventEmitter.call(this);
	  var feature = new Features[clients.dynamodb.config.apiVersion](clients);

	  var opts = options || {};
	  var initialize = opts.initialize;

	  this.apiVersion = feature.client.config.apiVersion;
	  this._feature = feature;
	  this._options = _.omit(opts, 'initialize');
	  this._initializer = opts.initialize;
	  this._callbacks = {};

	  if(typeof this._initializer === 'function') {
	    this._initializer.bind(this)();
	  }
	}
	util.inherits(QueryBuilder, EventEmitter);

	interfaces.forEach(function(m){
	  QueryBuilder.prototype[m] = function(){
	    this._feature[m].apply(this._feature, _.toArray(arguments));
	    return this;
	  };
	});

	QueryBuilder.prototype.freshBuilder = function(){
	  return new QueryBuilder({
	      dynamodb: this._feature.client,
	      promisifidRawClient: this._feature.promisifidRawClient
	    },
	    _.clone(_.extend(this._options, {initialize: this._initializer}))
	  );
	};

	QueryBuilder.prototype.tableName = function(){
	  return this._feature.conditions.TableName;
	};

	QueryBuilder.prototype.normalizationRawResponse = function(data){
	  return this._feature.normalizationRawResponse(data);
	};

	QueryBuilder.prototype.feature = function(cb){
	  cb(this._feature);
	  return this;
	};

	QueryBuilder.prototype.rawClient = function(cb){
	  return this._feature.promisifidRawClient;
	};

	QueryBuilder.prototype.callbacks = function(name, fn){
	  if(!this._callbacks[name]){
	    this._callbacks[name] = [];
	  }
	  this._callbacks[name].push(fn);
	  return this;
	};

	function callbacksPromisified(callbacks, data){
	  return (callbacks || []).map(function(f){
	    return f.bind(this)(data);
	  }.bind(this));
	}

	_.each([
	  'then',
	], function(promiseInterface){
	  QueryBuilder.prototype[promiseInterface] = function(cb){
	    var self = this;
	    var feature = self._feature;
	    var callbacks = this._callbacks;
	    var timer;

	    return Promise.all(callbacksPromisified.bind(self)(callbacks.beforeQuery)).then(function(){
	      var built = feature.buildQuery();
	      self.emit('beforeQuery', built.params);

	      return new Promise(function(resolve, reject){
	        var request = feature.client[built.method](built.params, function(err, data){
	          if(timer) {
	            clearTimeout(timer);
	            timer = null;
	          }
	          if(err) {
	            return reject(err);
	          }
	          resolve(data);
	        });

	        // Handle timeout
	        if(self._options.timeout !== null) {
	          timer = setTimeout(function(){
	            request.abort();
	            reject(new Error("The connection has timed out."));
	          }, self._options.timeout || 5000);
	        }
	      });
	    })
	    .then(function(data){
	      return Promise.all(callbacksPromisified.bind(self)(callbacks.afterQuery, data)).then(function(){
	        self.emit('afterQuery', data);
	        return data;
	      });
	    })
	    .then(function(data){
	      return cb.bind(self)(data);
	    });
	  };
	});


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	module.exports = [
	  'select',
	  'table',
	  'count',
	  'all',
	  'where',
	  'first',
	  'whereIn',
	  'whereBetween',
	  'whereBeginsWith',
	  'filterBetween',
	  'filterBeginsWith',
	  'filter',
	  'filterIn',
	  'filterNull',
	  'filterNotNull',
	  'filterContains',
	  'filterNotContains',
	  'limit',
	  'offset',
	  'desc',
	  'asc',
	  'create',
	  'update',
	  'set',
	  'delete',
	  'showTables',
	  'indexName',
	  'describe',
	  'createTable',
	  'deleteTable',
	];


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ },
/* 11 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(14);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(15);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(13)))

/***/ },
/* 13 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 15 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var Promise = __webpack_require__(10);

	exports.isEmpty = function(val){
	  if(val === null) return true;
	  if(val === '') return true;
	  if(_.isArray(val) && val.length === 0) return true;
	  if(_.isObject(val) && _.keys(val).length === 0) return true;
	  return false;
	};

	exports.newObject = function(key, val){
	  var o = {};
	  o[key] = val;
	  return o;
	};

	exports.toPascalCase = function(string){
	  var camelized = string.replace(/_./g, function(str) {
	    return str.charAt(1).toUpperCase();
	  });

	  return camelized.charAt(0).toUpperCase() + camelized.slice(1);
	};

	exports.collectionFlatten = function(collection){
	  var newObj = {};
	  _.each(collection, function(obj){
	    _.extend(newObj, obj);
	  });
	  return newObj;
	};

	exports.PromiseWaterfall = function(promises){

	  return new Promise(function(resolve, reject){
	    var results = [];

	    function watefallThen(promise){

	      if(promise && typeof promise.then === 'function') {
	        promise.then(function(data){
	          results.push(data);
	          watefallThen(promises.shift());
	        }).catch(reject);
	      } else if(promise && typeof promise.then !== 'function') {

	        reject(new TypeError("Function return value should be a promise."));

	      } else {
	        resolve(results);
	      }
	    }

	    watefallThen(promises.shift());
	  });

	};

	exports.lazyPromiseRunner = function(cb) {
	  return {
	    then: function(callback){
	      return cb().then(callback);
	    }
	  };
	};

	exports.pairEach = function(keys, values) {
	  var obj = {};
	  keys.forEach(function(key, i){
	    obj[key] = values[i];
	  });
	  return obj;
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var util = __webpack_require__(12);
	var EventEmitter = __webpack_require__(11).EventEmitter;
	var DOC = __webpack_require__(18);

	var utils = __webpack_require__(16);
	var api = __webpack_require__(20);

	var clientPools = {};

	var extraOperators = {
	  where: [
	    'BEGINS_WITH',
	    'BETWEEN'
	  ],
	  filter: [
	    'BETWEEN',
	    'BEGINS_WITH',
	    'NOT_NULL',
	    'NULL',
	    'CONTAINS',
	    'NOT_CONTAINS',
	    'IN'
	  ]
	};

	var availableOperators = api.availableOperators.concat(extraOperators.filter);

	var parameterBuilder = {};

	parameterBuilder.createTable = parameterBuilder.deleteTable = function(feature){
	  return { conditions: feature.params };
	};

	parameterBuilder.deleteItem = parameterBuilder.getItem = parameterBuilder.updateItem = function(feature){
	  var cond = utils.collectionFlatten(_.map(feature.whereConditions, function(param){
	    return utils.newObject(param.key, param.values[0]);
	  }));

	  return { conditions: { Key: cond } };
	};

	parameterBuilder.query = function(feature){
	  var obj = {};

	  obj.KeyConditions = feature.toDocClientConditon(feature.whereConditions);

	  if(!_.isEmpty(feature.filterConditions)){
	    obj.QueryFilter = feature.toDocClientConditon(feature.filterConditions);
	  }

	  return { conditions: obj };
	};

	parameterBuilder.putItem = function(feature){
	  if(_.isArray(feature.params)) {
	    var items = feature.params.map(function(item){
	      return {PutRequest: { Item: item } };
	    });

	    var tableName = feature.conditions.TableName;

	    return {
	      beforeQuery: function(){
	        this.nonTable();
	      },
	      nextThen: 'batchWriteItem',
	      conditions: {
	        RequestItems: utils.newObject(tableName, items)
	      }
	    };

	  }else{
	    return {conditions: { Item: feature.params } };
	  }
	};

	parameterBuilder.batchGetItem = function(feature){
	  var requestItems = {};
	  requestItems[feature.conditions.TableName] = {
	    Keys: feature.whereInConditions
	  };

	  ['AttributesToGet', 'ConsistentRead', 'ProjectionExpression', 'ExpressionAttributeNames'].forEach(function(attr){
	    if(feature.conditions[attr]){
	      requestItems[feature.conditions.TableName][attr] = feature.conditions[attr];
	      delete feature.conditions[attr];
	    }
	  });

	  return {
	    beforeQuery: function(){
	      this.nonTable();
	    },
	    conditions: {
	      RequestItems : requestItems
	    }
	  };
	};

	function Feature(clients){
	  EventEmitter.call(this);

	  this.client = clients.dynamodb;

	  this.promisifidRawClient = clients.promisifidRawClient;

	  this.nextThen = undefined;

	  this.params = {};

	  this.whereConditions = [];

	  this.whereInConditions = [];

	  this.filterConditions = [];

	  this.conditions = {};

	  this.schema = {};
	}

	util.inherits(Feature, EventEmitter);

	_.each(api.operations, function(spec, method){
	  _.each(spec.input.members, function(typeSpec, member){
	    Feature.prototype[_.camelCase(member)] = function(params){
	      this.conditions[member] = params;
	      return this;
	    };
	  });
	});

	_.each(api.transformFunctionMap, function(oldM, newM){
	  Feature.prototype[newM] = function(params){
	    this.nextThen = oldM;
	    this.params = params;
	  };
	});

	Feature.prototype.select = function(){
	  this.attributesToGet(_.toArray(arguments));
	};

	Feature.prototype.table = function(tableName){
	  this.tableName(tableName);
	};

	Feature.prototype.count = function(){
	  this.conditions.Select = 'COUNT';
	  this.nextThen = 'query';
	};

	Feature.prototype.offset = function(exclusiveStartKey){
	  this.exclusiveStartKey(exclusiveStartKey);
	};

	Feature.prototype.whereIn = function(keys, values){
	  //items[this.conditions.TableName] = {};
	  if(!_.isArray(keys)) {
	    keys = [keys];
	  }
	  this.whereInConditions = this.whereInConditions.concat(values.map(function(val){
	    if(!_.isArray(val)){
	      val = [val];
	    }

	    if(val.length !== keys.length) {
	      throw new Error('the length of key and value did not match.');
	    }
	    return utils.pairEach(keys, val);
	  }));
	  this.nextThen = 'batchGetItem';
	};

	_.each([
	  'filter',
	  'where'
	], function(operator){

	  Feature.prototype[operator] = function(){
	    addConditions.apply(this, [operator].concat(_.toArray(arguments)));
	    return this;
	  };

	  _.each(extraOperators[operator], function(_operator){
	    Feature.prototype[operator + utils.toPascalCase(_operator.toLowerCase())] = function(){
	      var args = _.toArray(arguments);
	      var newArgs = [operator, args.shift(), _operator].concat(args);
	      addConditions.apply(this, newArgs);
	      return this;
	    };
	  });
	});

	function addConditions(){
	  var args = _.toArray(arguments);
	  var col = args[1], op = args[2], val = args[3];
	  if(!_.contains(availableOperators, op)){
	    val = op;
	    op = '=';
	  }

	  this[args[0]+'Conditions'].push({
	    key: col,
	    values: [val].concat(Array.prototype.slice.call(args, 4)),
	    operator: op
	  });
	}

	Feature.prototype.toDocClientConditon = function(conditions){
	  var self = this;
	  return conditions.map(function(cond){
	    var args = [
	      cond.key,
	      api.transformOperatorMap[cond.operator] || cond.operator
	    ].concat(cond.values);
	    return self.client.Condition.apply(null, args);
	  });
	};

	Feature.prototype.set = function(key, action, value){
	  if(!this.conditions.AttributeUpdates) {
	    this.conditions.AttributeUpdates = {};
	  }

	  this.conditions.AttributeUpdates[key] = {
	    Action: action,
	    Value: value
	  };

	  return this;
	};

	Feature.prototype.asc = function(){
	  this.scanIndexForward(true);
	};

	Feature.prototype.desc = function(){
	  this.scanIndexForward(false);
	};

	Feature.prototype.nonTable = function(){
	  this.conditions = _.omit(this.conditions, 'TableName');
	};

	Feature.prototype.normalizationRawResponse = function(data){
	  // query operation
	  if(data.Items) {
	    return data.Items;
	  }

	  // getItem operation
	  if(data.Item) {
	    return data.Item;
	  }

	  // batchGetItem Operation
	  if(data.Responses && data.Responses[this.conditions.TableName]) {
	    return data.Responses[this.conditions.TableName].reverse();
	  }
	};

	Feature.prototype.buildQuery = function(){
	  var nextThen = this.nextThen || 'query';
	  var self = this;

	  if(this.whereInConditions.length > 0 && this.whereConditions.length > 0) {
	    throw new Error('Can not specify the parameters of batchGetImte and Query operation at the same time');
	  }

	  function supplement(builder){
	    if(!builder) return undefined;

	    return function(){
	      var result = builder(self);
	      if(!result.beforeQuery) result.beforeQuery = function(){};
	      if(!result.nextThen) result.nextThen = nextThen;

	      return result;
	    };
	  }

	  var builder = supplement(parameterBuilder[nextThen]) || function(){
	    return {
	      beforeQuery: function(){},
	      conditions: {},
	      nextThen: nextThen
	    };
	  };

	  var built = builder();
	  built.beforeQuery.call(this);

	  this.nextThen = built.nextThen;
	  this.conditions = _.extend(this.conditions, built.conditions);

	  return {
	    params: this.conditions,
	    method: this.nextThen
	  };
	};


	module.exports = Feature;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Create an instance of the DynamoDB Document client.
	 *
	 * @constructor
	 * @class DynamoDB
	 * @param {AWS.DynamoDB} dynamoDB An instance of the service provided AWS SDK (optional).
	 * @returns {DynamoDB} Modified version of the service for Document support.
	 */
	function DynamoDB(dynamoDB) {
	    var isBrowser = typeof(window) === "undefined";
	    var AWS = isBrowser ? __webpack_require__(4) : window.AWS;

	    var condition = isBrowser ? __webpack_require__(19).DynamoDBCondition : window.DynamoDBCondition;

	    var datatypes = isBrowser ? __webpack_require__(3).DynamoDBDatatype : window.DynamoDBDatatype;
	    var t = new datatypes();

	    var formatter = isBrowser ? __webpack_require__(5).DynamoDBFormatter : window.DynamoDBFormatter;
	    var f = new formatter();

	    var service = dynamoDB || new AWS.DynamoDB();

	    var setupLowLevelRequestListeners = service.setupRequestListeners;
	    service.setupRequestListeners = function(request) {
	        setupLowLevelRequestListeners.call(this, request);

	        request._events.validate.unshift(f.formatInput);
	        request.on("extractData", f.formatOutput);
	    };

	    /**
	     * Utility to create Set Object for requests.
	     *
	     * @function Set
	     * @memberOf DynamoDB#
	     * @param {array} set An array that contains elements of the same typed as defined by {type}.
	     * @param {string} type Can only be a [S]tring, [N]umber, or [B]inary type.
	     * @return {Set} Custom Set object that follow {type}.
	     * @throws InvalidSetType, InconsistentType
	     */
	    service.__proto__.Set = function(set, type) {
	        return t.createSet(set, type);
	    };

	    /**
	    * Creates an instance of Condition and should be used with the DynamoDB client.
	    *
	    * @function Condition
	    * @memberOf DynamoDB#
	    * @param {string} key The attribute name being conditioned.
	    * @param {string} operator The operator in the conditional clause. (See lower level docs for full list of operators)
	    * @param val1 Potential first element in what would be the AttributeValueList
	    * @param val2 Potential second element in what would be the AttributeValueList
	    * @return {Condition} Condition for your DynamoDB request.
	    */
	    service.__proto__.Condition = function(key, operator, val1, val2) {
	        return condition(key, operator, val1, val2);
	    };

	    /**
	     * Utility to convert a String to the necessary Binary object.
	     *
	     * @function StrToBin
	     * @memberOf DynamoDB#
	     * @param {string} value String value to converted to Binary object.
	     * @return {object} Return value will be a Buffer or Uint8Array in the browser.
	     * @throws StrConversionError
	     */
	    service.__proto__.StrToBin = function(value) {
	        return t.strToBin(value);
	    };
	    /**
	     * Utility to convert a Binary object into its String equivalent.
	     *
	     * @function BinToStr
	     * @memberOf DynamoDB#
	     * @param {object} value Binary value (Buffer | Uint8Array) depending on environment.
	     * @return {string} Return value will be the string representation of the Binary object.
	     * @throws BinConversionError
	     */
	    service.__proto__.BinToStr = function(value) {
	        return t.binToStr(value);
	    };

	    return service;
	}

	if (true) {
	    var exports = module.exports = {};
	    exports.DynamoDB = DynamoDB;
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Creates an instance of Condition that is used by the DynamoDB Document client.
	 *
	 * @param {string} key The attribute name being conditioned on.
	 * @param {string} operator The operator in the conditional clause. (See aws sdk docs for full list of operators)
	 * @param val1 Potential first element in what would be the AttributeValueList
	 * @param val2 Potential second element in what would be the AttributeValueList
	 * @return {Condition} Condition for your DynamoDB request.
	 */
	function DynamoDBCondition(key, operator, val1, val2) {
	    var datatypes = typeof(window) === "undefined" ? __webpack_require__(3).DynamoDBDatatype
	                : window.DynamoDBDatatype;

	    var t = new datatypes();

	    var CondObj = function Condition(key, operator, val1, val2) {
	            this.key = key;
	            this.operator = operator;
	            this.val1 = val1;
	            this.val2 = val2;
	        
	            this.format = function() {
	                var formatted = {};
	        
	                var attrValueList = [];
	                if (this.val1 !== undefined) {
	                    attrValueList.push(t.formatDataType(this.val1)); 
	                }
	                if (this.val2 !== undefined) {
	                    attrValueList.push(t.formatDataType(this.val2));
	                }
	                if (attrValueList.length > 0) {
	                    formatted.AttributeValueList = attrValueList;
	                }
	                formatted.ComparisonOperator = this.operator;
	        
	                return formatted;
	            };
	    };

	    var cond = new CondObj(key, operator, val1, val2);
	    cond.prototype = Object.create(Object.prototype);
	    cond.prototype.instanceOf  = "DynamoDBConditionObject";

	    return cond;
	}

	if (true) {
	    var exports = module.exports = {};
	    exports.DynamoDBCondition = DynamoDBCondition;
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var _ = __webpack_require__(2);
	var utils = __webpack_require__(16);
	var fs = __webpack_require__(21);

	function getDynamoDBOperations(){
	  // Browser.
	  if(this.AWS) {
	    return this.AWS.apiLoader.services.dynamodb['2012-08-10'].operations;
	  }

	  // Node.js
	  var dynamoApiJsonPath = 'aws-sdk/apis/dynamodb-2012-08-10.min.json';

	  try {

	    return __webpack_require__(22)(dynamoApiJsonPath).operations;

	  } catch(e) {
	    var pathFromWorkingDir = process.cwd() + "/node_modules/" + dynamoApiJsonPath;

	    if(fs.existsSync(pathFromWorkingDir)){
	      return __webpack_require__(22)(pathFromWorkingDir).operations;
	    }

	    throw new TypeError("Module `aws-sdk` is required for npdynamodb");
	  }
	}

	var operations = getDynamoDBOperations(this);

	//available methods.(api version 2012-08-10)
	var apis = [
	  {
	    origin: 'createTable',
	    transformed: 'createTable'
	  },

	  {
	    origin: 'deleteTable',
	    transformed: 'deleteTable'
	  },

	  {
	    origin: 'deleteItem',
	    transformed: 'delete'
	  },

	  {
	    origin: 'describeTable',
	    transformed: 'describe'
	  },

	  {
	    origin: 'listTables',
	    transformed: 'showTables',
	  },

	  {
	    origin: 'putItem',
	    transformed: 'create'
	  },

	  {
	    origin: 'updateItem',
	    transformed: 'update'
	  },

	  {
	    origin: 'getItem',
	    transformed: 'first'
	  },

	  {
	    origin: 'query',
	    transformed: 'query',
	  },

	  {
	    origin: 'scan',
	    transformed: 'all'
	  },

	  {
	    origin: 'updateTable',
	    transformed: 'alterTable'
	  },

	  {
	    origin: 'waitFor',
	    transformed: 'waitFor'
	  }
	];

	var transformOperatorMap = {
	  '=' : 'EQ',
	  '!=': 'NE',
	  '<=': 'LE',
	  '<': 'LT',
	  '>=': 'GE',
	  '>': 'GT',
	};

	module.exports = {
	  operations: operations,

	  originalApis: _.keys(operations).map(function(api){
	    return _.camelCase(api);
	  }).concat(['waitFor']),

	  transformFunctionMap: utils.collectionFlatten(apis.map(function(api){
	    return utils.newObject(api.transformed, api.origin);
	  })),

	  transformOperatorMap: transformOperatorMap,

	  availableOperators: _.keys(transformOperatorMap)
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ },
/* 21 */
/***/ function(module, exports) {

	

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./api": 20,
		"./api.js": 20,
		"./feature": 17,
		"./feature.js": 17,
		"./schema": 23,
		"./schema.js": 24
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 22;


/***/ },
/* 23 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 24 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Promise = __webpack_require__(10);

	module.exports = function(lib, apis){
	  var promisifiedMethods = {};

	  apis.forEach(function(m){
	    promisifiedMethods[m] = Promise.promisify(lib[m], lib);
	  });

	  return promisifiedMethods;
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./2012-08-10/api": 20
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 26;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var util = __webpack_require__(12);

	var utils = __webpack_require__(16);
	var npdynamodb = __webpack_require__(7);

	var BaseModel = __webpack_require__(28);

	module.exports = function(tableName, prototypeProps, staticProps){

	  var reservedProps = ['hashKey', 'rangeKey', 'npdynamodb'];

	  function Model(attributes){
	    this.tableName = tableName;

	    _.extend(this, _.pick.apply(null, [prototypeProps].concat(reservedProps)));

	    this._attributes = attributes || {};

	    this._builder = this.npdynamodb().table(tableName);
	  }

	  _.extend(Model.prototype, _.clone(BaseModel.prototype));

	  _.each(_.omit.apply(null, [prototypeProps].concat(reservedProps)), function(val, name){
	    if(val.hasOwnProperty('bind')) {
	      Model.prototype[name] = function(){
	        return val.bind(this, _.toArray(arguments));
	      };
	    }else{
	      Model.prototype[name] = val;
	    }
	  });

	  _.each([
	    'find',
	    'where',
	    'query',
	    'fetch',
	    'save'
	  ], function(_interface){
	    Model[_interface] = function(){
	      var model = new Model();
	      return model[_interface].apply(model, _.toArray(arguments));
	    };
	  });

	  _.each(staticProps, function(val, name){
	    if(val.hasOwnProperty('bind')) {
	      Model[name] = val.bind(Model);
	    }else{
	      Model[name] = val;
	    }
	  });

	  return Model;
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var Collection = __webpack_require__(29);
	var promiseRunner = __webpack_require__(30);

	module.exports = Model;

	function Runner(query, formatter){
	  var self = this;
	  return promiseRunner(query, function(data){
	    self._refreshBuilder();
	    return formatter(data);
	  })
	  .bind(this);
	}

	function Model(){}

	Model.prototype.where = function(){
	  this._builder.where.apply(this._builder, arguments);
	  return this;
	};

	Model.prototype.query = function(fn){
	  if(typeof fn === 'function') {
	    fn(this._builder);
	    return this;
	  }

	  return this._builder;
	};

	Model.prototype.find = function(hashKeyVal, rangeKeyVal){
	  var self = this;
	  var query = this._builder.where(this.hashKey, hashKeyVal);

	  if(rangeKeyVal) {
	    query.where(this.rangeKey, rangeKeyVal);
	  }

	  return Runner.bind(this)(query.first(), function(data){
	    self._attributes = self._builder.normalizationRawResponse(data);
	    return self;
	  });
	};

	Model.prototype.reload = function(){
	  return this.find(this.get(this.hashKey), this.get(this.rangeKey));
	};

	Model.prototype.fetch = function(){
	  var self = this;

	  return Runner.bind(this)(this._builder, function(data){
	    var items = self._builder.normalizationRawResponse(data);
	    var models = items.map(function(item){
	      return new self.constructor(item);
	    });

	    return new Collection(models);
	  });
	};

	Model.prototype.save = function(item){
	  var self = this;

	  if(typeof item === 'object'){
	    _.extend(this._attributes, item);
	  }

	  return Runner.bind(this)(this._builder.create(this.attributes()), function(){
	    return self;
	  });
	};

	Model.prototype.destroy = function(item){
	  var self = this;

	  var query = this._builder.where(this.hashKey, this.get(this.hashKey));

	  if(this.rangeKey) {
	    query.where(this.rangeKey, this.get(this.rangeKey));
	  }

	  return Runner.bind(this)(query.delete(), function(){
	    self._attributes = {};
	    return self;
	  });
	};

	Model.prototype.set = function(key, value){
	  this._attributes[key] = value;
	  return this;
	};

	Model.prototype.unset = function(key){
	  if(this._attributes[key]) {
	    delete this._attributes[key];
	  }
	  return this;
	};

	Model.prototype.extend = function(attributes){
	  _.extend(this._attributes, attributes);
	  return this;
	};

	Model.prototype.get = function(key){
	  return this._attributes[key];
	};

	Model.prototype.isEmpty = function(){
	  return _.isEmpty(this._attributes);
	};

	Model.prototype.attributes = function(){
	  return this._attributes;
	};

	Model.prototype.toJson = function(){
	  return JSON.stringify(this._attributes);
	};

	Model.prototype._refreshBuilder = function(){
	  this._builder = this.npdynamodb().table(this.tableName);
	};

	_.each([
	  'each',
	  'map',
	  'includes',
	  'contains',
	  'keys',
	  'pick',
	  'values',
	], function(name){
	  Model.prototype[name] = function(){
	    var args = [this._item].concat(_.map(arguments, function(arg){ return arg; }));
	    return _[name].apply(_, args);
	  };
	});


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);

	module.exports = Collection;

	function Collection(items){
	  this._items = items;
	}

	Collection.prototype.toArray = function(){
	  return this._items.map(function(item){
	    return item.attributes();
	  });
	};

	Collection.prototype.toJSON = function(){
	  return JSON.stringify(this.toArray());
	};

	Collection.prototype.indexAt = function(index){
	  return this._items[index];
	};

	Collection.prototype.at = function(index){
	  return this.indexAt(index);
	};

	_.each([
	  'pluck'
	], function(name){
	  Collection.prototype[name] = function(){
	    var args = [this.toArray()].concat(_.map(arguments, function(arg){ return arg; }));
	    return _[name].apply(_, args);
	  };
	});

	_.each([
	  'each',
	  'map',
	  'reduce',
	  'reduceRight',
	  'find',
	  'filter',
	  'where',
	  'findWhere',
	  'reject',
	  'every',
	  'some',
	  'invoke',
	  'sortBy',
	  'groupBy',
	  'indexBy',
	  'countBy',
	  'shuffle',
	  'sample',
	  'size',
	  'partition',
	  'first',
	  'last',
	  'isEmpty'
	], function(name){
	  Collection.prototype[name] = function(){
	    var args = [this._items].concat(_.map(arguments, function(arg){ return arg; }));
	    return _[name].apply(_, args);
	  };
	});


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Promise = __webpack_require__(10);

	module.exports = function(promsie, formatter) {
	  var self = this;
	  return new Promise(function(resolve, reject){
	    return promsie.then(function(data){
	      if(!formatter) {
	        formatter = function(data){ return data; };
	      }
	      return resolve(formatter(data));
	    }).catch(reject);
	  });
	};


/***/ }
/******/ ])
});
;