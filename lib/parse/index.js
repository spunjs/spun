'use strict';

var async = require('async');

var injectIncludes = require('./inject-includes');
var readAndParse = require('./read-and-parse');
var removeUnwantedSpecs = require('./remove-unwanted-specs');
var replaceVariables = require('./replace-variables');
var resolveGetCommands = require('./resolve-get-commands');
var validateArguments = require('./validate-arguments');
var addArgContextToLines = require('./add-arg-context-to-lines');
var validateOrdering = require('./validate-ordering');
var validateQueries = require('./validate-queries');

module.exports = function parse(argv, wantedSpunFiles){
  return function(cb){
    async.waterfall([
      readAndParse(wantedSpunFiles, argv),
      injectIncludes,
      removeUnwantedSpecs(wantedSpunFiles),
      //specs, cb
      validateArguments,
      //specs, cb
      replaceVariables(argv.variables),
      //specs, cb
      validateArguments,
      //specs, cb
      addArgContextToLines,
      //specs, cb
      validateQueries,
      //specs, cb
      validateOrdering,
      //specs, cb
      resolveGetCommands
    ], cb);
  };
};
