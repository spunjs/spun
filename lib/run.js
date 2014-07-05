'use strict';

var async = require('async');
var spawn = require('child_process').spawn;
var sutil = require('spun-util');
var errors = sutil.errors.running;

module.exports = function run(argv){
  return function(specs, cb){
    var contexts = [];
    var queue = async.queue(function(context, queueCb){
      var browser = context.browser;
      var spec = context.spec;
      var env = Object.create(process.env);
      env.BROWSER = browser;
      var runner = spawn(argv.runner, [], {cwd: argv.provider, env: env});
      runner.on('error', queueCb);
      runner.on('exit', function(code){
        var error;
        if(code)error = new errors.ExitedWithBadCodeError(code, spec);
        queueCb(error);
      });
      runner.stderr.pipe(process.stderr);
      runner.stdin.write(spec.compiled, 'utf-8');
      runner.stdin.end();
    }, argv.workerCount);

    argv.browsers.forEach(function(browser){
      specs.forEach(function(spec){
        contexts.push({
          browser: browser,
          spec: spec
        });
      });
    });

    queue.push(contexts, function(err){
      if(err){
        queue.kill();
      }
      cb(err);
    });
  };
};
