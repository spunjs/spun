'use strict';

var async = require('async');

var compile = require('./compile');
var injectIncludes = require('./inject-includes');
var parse = require('./parse');
var readAndParse = require('./read-and-parse');
var validate = require('./validate');

module.exports = function run(argv, spunFiles, strategyProvider, cb){
  async.waterfall([
    readAndParse(spunFiles, argv),
    injectIncludes,
    validate,
    compile
  ], cb);
};
