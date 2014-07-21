'use strict';

module.exports = readAndParse;

var async = require('async');
var errHandler = require('err-handler');
var errors = require('./errors');
var fs = require('fs');
var isFile = require('is-file');
var path = require('path');
var resolve = path.resolve;
var extname = path.extname;
var dirname = path.dirname;
var basename = path.basename;

var h = require('../helpers');
var parse = require('./parse');

function readAndParse(spunFiles, argv){
  spunFiles = spunFiles.map(h.createReadContext);

  return function(waterfallCb){
    var specs = [];
    var queue = async.queue(function(readContext, queueCb){
      fs.readFile(readContext.path, errHandler(queueCb, function(file){
        file = '' + file;
        parse(file, readContext, includeResolver, errHandler(queueCb, function(spec){
          specs.push(spec);
          queueCb();
        }));
      }));
    }, argv.workerCount);

    queue.drain = function(){
      waterfallCb(null, specs);
    };

    queue.push(spunFiles, stopQueue);

    function includeResolver(line, lines, ancestors){
      var arg;
      if(line.tokens[1] !== undefined) 
        arg = h.stripQuotes(line.tokens[1].value);
      else
        return stopQueue(new errors.MissingIncludePath(line, lines));

      var includePath = resolve(dirname(line.file), arg);
      var ext = extname(includePath);

      if(ext !== '.spun')includePath += '.spun';
      if(!isFile(includePath)) return stopQueue(new errors.InvalidIncludePathError(line, lines));
      if(line.file === includePath) return stopQueue(new errors.SelfReferencingIncludeError(line, lines));
      if(ancestors.indexOf(includePath) > -1) return stopQueue(new errors.InfiniteIncludeError(line, lines));

      line.includePath = includePath;

      queue.push(h.createReadContext(includePath, ancestors), stopQueue);
    }

    function stopQueue(err){
      if(err){
        queue.kill();
        waterfallCb(err);
      }
    }
  };
}
