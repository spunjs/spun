'use strict';

var async = require('async');

var injectIncludes = require('./inject-includes');
var parse = require('./parse');
var readAndParse = require('./read-and-parse');
var validate = require('./validate');

module.exports = function parse(argv, spunFiles){
  return function(cb){
    async.waterfall([
      readAndParse(spunFiles, argv),
      injectIncludes,
      validate
    ], cb);
  };
};
