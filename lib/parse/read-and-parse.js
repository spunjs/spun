'use strict';

module.exports = readAndParse;

var async = require('async');
var errHandler = require('err-handler');
var errors = require('spun-util').errors;
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

    function includeResolver(line, ancestors){
      var includePath = resolve(dirname(line.file), line.args);
      var ext = extname(includePath);

      if(ext !== '.spun')includePath += '.spun';
      if(!isFile(includePath)) return stopQueue(new errors.parsing.InvalidIncludePathError(line));
      if(line.file === includePath) return stopQueue(new errors.parsing.SelfReferencingIncludeError(line));
      if(ancestors.indexOf(includePath) > -1) return stopQueue(new errors.parsing.InfiniteIncludeError(line));

      line.args = includePath;

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
