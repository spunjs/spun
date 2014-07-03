'use strict';

var async = require('async');
var Compiler = require('./compiler');
var errHandler = require('err-handler');
var errors = require('spun-util').errors;
var fs = require('fs');
var path = require('path');
var resolve = path.resolve;
var extname = path.extname;
var dirname = path.dirname;
var basename = path.basename;
var isFile = require('is-file');

/**
 * This runs everything from parsing to compiling.  For testing purposes, it may
 * be better to split this up in the future.
 */
module.exports = function run(argv, spunFiles, strategyProvider, cb){
  var globalContext = {};
  var compiler = new Compiler(globalContext, strategyProvider);

  async.waterfall([
    /**
     * Read and parse
     */
    function readAndParse(waterfallCb){
      var specs = [];
      var queue = async.queue(function(readContext, queueCb){

        //TODO: implement caching
        fs.readFile(readContext.path, errHandler(stopQueue, function(file){
          file = '' + file;
          compiler.parse(file, readContext, includeResolver, errHandler(stopQueue, function(spec){
            specs.push(spec);
            queueCb();
          }));
        }));
      }, argv.workerCount);

      queue.drain = function(){
        waterfallCb(null, specs);
      };

      spunFiles
      .map(createReadContext)
      .forEach(queue.push);

      function includeResolver(spec, line, ancestors){
        var includePath = resolve(dirname(spec.path), line.args);
        var ext = extname(includePath);

        if(ext !== '.spun')includePath += '.spun';
        if(!isFile(includePath)) return stopQueue(new errors.parsing.InvalidIncludePathError(spec, line));
        if(spec.path === includePath) return stopQueue(new errors.parsing.SelfReferencingIncludeError(spec, line));
        if(ancestors.indexOf(includePath) > -1) return stopQueue(new errors.parsing.InfiniteIncludeError(spec, line));

        queue.push(createReadContext(includePath, ancestors));
      }

      function createReadContext(path, ancestors){
        ancestors = Array.isArray(ancestors) ? ancestors : [];
        ancestors.push(path);//we don't care about duplicates here

        return {
          path: path,
          ancestors: ancestors
        };
      }

      function stopQueue(err){
        queue.kill();
        waterfallCb(err);
      }
    },
    function validateSpecs(specs, cb){
      var queue = async.queue(function(spec, queueCb){
        compiler.validate(spec, function(err){
          if(err){
            queue.kill();
            cb(err);
          } else queueCb();
        });
      }, argv.workerCount);

      queue.drain = function(){
        cb(null, specs);
      };

      specs.forEach(queue.push);
    },
    function compileSpecs(specs, cb){
      cb(null, specs);
    }
  ], cb);
};
