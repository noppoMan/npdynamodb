'use strict';

var webpack = require('webpack');

var externals = [
  {
    "bluebird": {
    root: "Promise",
    commonjs2: "bluebird",
    commonjs: "bluebird",
    amd: "bluebird"
    },
    "lodash": {
      root: "_",
      commonjs2: "lodash",
      commonjs: "lodash",
      amd: "lodash"
    },
    "aws-sdk": {
      root: "AWS",
      commonjs2: "aws-sdk",
      commonjs: "aws-sdk",
      amd: "aws-sdk"
    }
  }
];

module.exports = {

  module: {
    loaders: [
      {
        include: /\.json$/, loaders: ["json-loader"]
      }
    ],
    resolve: {
      extensions: ['', '.json', '.js']
    }
  },

  output: {
    library: 'npdynamodb',
    libraryTarget: 'umd'
  },

  node: {
    fs: "empty"
  },

  externals: externals,

  verbose: true

};
