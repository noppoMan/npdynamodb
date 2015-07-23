#!/bin/bash -e

npm install webpack@1.10.1 json-loader@0.5.2 uglify-js@2.4.24

webpack=node_modules/.bin/webpack
uglifyjs=node_modules/.bin/uglifyjs

DEST_DIR='./build'

if [ ! -d "$DEST_DIR" ]; then
  mkdir $DEST_DIR
fi

$webpack --config scripts/webpack.config.js index.js $DEST_DIR/npdynamodb.js
$uglifyjs $DEST_DIR/npdynamodb.js -o $DEST_DIR/npdynamodb.min.js -c -m
