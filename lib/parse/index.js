'use strict';

var async = require('async');

var injectIncludes = require('./inject-includes');
var readAndParse = require('./read-and-parse');
var replaceVariables = require('./replace-variables');
var resolveGetCommands = require('./resolve-get-commands');
var validate = require('./validate');

module.exports = function parse(argv, spunFiles){
  return function(cb){
    async.waterfall([
      readAndParse(spunFiles, argv),
      injectIncludes,
      //specs, cb
      validate,
      //specs, cb
      replaceVariables,
      //specs, cb
      resolveGetCommands
    ], cb);
  };
};
