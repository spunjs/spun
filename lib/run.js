'use strict';

var async = require('async');
var h = require('./helpers');
var parse = require('./parse');
var validate = require('./validate');
var compile = require('./compile');
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

  async.waterfall([
    function readAndParse(waterfallCb){
      var specs = [];
      var queue = async.queue(function(readContext, queueCb){
        fs.readFile(readContext.path, errHandler(stopQueue, function(file){
          file = '' + file;
          parse(file, readContext, includeResolver, errHandler(stopQueue, function(spec){
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

      function includeResolver(line, ancestors){
        var includePath = resolve(dirname(line.file), line.args);
        var ext = extname(includePath);

        if(ext !== '.spun')includePath += '.spun';
        if(!isFile(includePath)) return stopQueue(new errors.parsing.InvalidIncludePathError(line));
        if(line.file === includePath) return stopQueue(new errors.parsing.SelfReferencingIncludeError(line));
        if(ancestors.indexOf(includePath) > -1) return stopQueue(new errors.parsing.InfiniteIncludeError(line));

        line.args = includePath;

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
    function injectIncludes(specs, cb){
      var specMap = {};
      var specsWithIncludes = specs.filter(h.bySpecsWithIncludes);

      specs.forEach(function(spec){
        specMap[spec.path] = spec;
      });

      while(specsWithIncludes.length){
        specsWithIncludes.forEach(function(spec){
          var lines = spec.lines, i, line, spliceCommand;

          for(i=0;i<lines.length;i++){
            line = lines[i];
            if(line.command === 'include'){
              spliceCommand = [i, 1].concat(specMap[line.args].lines);
              [].splice.apply(lines, spliceCommand);
            }
          }
        });
        specsWithIncludes = specsWithIncludes.filter(h.bySpecsWithIncludes);
      }
      cb(null, specs);
    },
    function validateSpecs(specs, cb){
      var queue = async.queue(function(spec, queueCb){
        validate(spec, function(err){
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
