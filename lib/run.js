'use strict';

var async = require('async');
var es = require('event-stream');
var once = require('once');
var spawn = require('child_process').spawn;
var sutil = require('spun-util');
var errors = sutil.errors.running;

module.exports = function run(argv, report){
  return function(specs, runCb){
    var STAMP = 'asdfasdf: ' + Date.now();
    var contexts = [];
    var queue = async.queue(function(context, queueCb){
      var browser = context.browser;
      var spec = context.spec;
      var env = Object.create(process.env);
      env.BROWSER = browser;
      var runner = spawn(argv.runner, [], {cwd: argv.provider, env: env});
      var setError = function setError(err){
        if(!context.error && err)context.error = err;
      };

      async.parallel([
        function handleEnd(cb){
          cb = once(cb);
          runner.on('error', function(err){
            setError(err);
            cb();
          });
          runner.on('exit', function(code){
            if(code)setError(new errors.ExitedWithBadCodeError(code, spec));
            cb();
          });
        },
        function handleOutput(cb){
          cb = once(cb);
          es
            .merge(
              runner.stdout,
              runner.stderr
            )
            .pipe(es.wait(function(err, out){
              setError(err);
              context.output = out;
              cb();
            }));
        }
      ], function(){
        queueCb(context.error);
      });
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

    if(!contexts.length)return setImmediate(runCb, null, []);

    queue.drain = function(){
      runCb(null, contexts);
    };

    contexts.forEach(function(context){
      queue.push(context, function(err){
        report(err, context);
      });
    });
  };
};

