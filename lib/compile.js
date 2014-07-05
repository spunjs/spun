'use strict';

module.exports = compile;

var f = require('util').format;
var h = require('./helpers');
var sutil = require('spun-util');
var errors = sutil.errors;

function compile(argv, Provider){
  return function(specs, cb){
    var error = null;

    specs.every(function(spec){
      var lines = [].concat(spec.lines);//make a copy for the strategies to modify.
      var line;
      var command;
      var previousLength = lines.length;//use this to make sure strategies are shifting
      var previousStrategy;
      var previousLine;
      var provider = new Provider(argv);

      while(!error && lines.length){
        line = lines[0];
        command = line.command;

        if(previousLine && previousLine === line){
          error = new errors.compiling.StrategyError(f(
            'The strategy "%s" failed to remove the line.\n   %s\n',
            previousStrategy,
            errors.getStack(lines, line)
          ));
          break;
        }

        if(!command){
          error = new errors.compiling.StrategyError(f(
            'The strategy for "%s" failed to handle lines up to the next command.\n   %s\n',
            previousStrategy,
            errors.getStack(lines, line)
          ));
          break;
        }

        if(!provider[command]){
          error = new errors.compiling.MissingStrategyError(command);
          break;
        }

        provider[command](lines);

        previousStrategy = command;
        previousLine = line;
      }

      if(error)return false;

      spec.compiled = provider.toString();
    });

    h.next(error, specs, cb);
  };
}
