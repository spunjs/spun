'use strict';

var async = require('async');

var injectIncludes = require('./inject-includes');
var readAndParse = require('./read-and-parse');
var replaceVariables = require('./replace-variables');
var resolveGetCommands = require('./resolve-get-commands');
var validate = require('./validate');
var validateArguments = require('./validate-arguments');

module.exports = function parse(argv, spunFiles){
  return function(cb){
    async.waterfall([
      readAndParse(spunFiles, argv),
      injectIncludes,
      //specs, cb
      validateArguments,
      //specs, cb
      replaceVariables,
      //specs, cb
      validate,
      //specs, cb
      resolveGetCommands
    ], cb);
  };
};
