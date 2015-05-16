'use strict';

var _ = require('lodash');
var Buffer = require('buffer').Buffer;


var stabData = _.range(1, 11).map(function(i){
  return {
    hash_key: "key1",
    range_key: i,
    gsi_hash_key: "gkey1", //gsi
    lsi_range_key: i, // lsi
    bool: true,
    binary: new Buffer([1,2,3,4]),
    null: true,
    stringSet: ["foo", "bar"],
    numberSet: [1, 2],
    binarySet: [new Buffer([1,2,3,4]), new Buffer([5,6,7,8])],
    document: {
      number1: 1,
      string1: "foo",
      list1: [
        {
          number2: 2,
          string2: 'bar',
          list2: [
            {
              number3:3,
              string3: 'foobar',
              list3: [
                {
                  number4:4,
                  string4: 'barfoo'
                }
              ]
            }
          ]
        }
      ]
    }
  };
});

module.exports = stabData;
