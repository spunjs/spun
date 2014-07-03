'use strict';

module.exports = compile;

var f = require('util').format;
var h = require('./helpers');
var sutil = require('spun-util');
var errors = sutil.errors;

function compile(argv, provider){
  return function(specs, cb){
    if(!provider.program)return h.next(
      new errors.compiling.MissingStrategyError('program'),
      null,
      cb
    );

    var compilerContext = {};

    var error = null;

    specs.every(function(spec){
      var specContext = {
        // provider.program should provide a toString method on this context.
        // We'll check that in a sec.  specContext.toString() should return the
        // compiled spec to use in output / running.
      };
      var lines = [].concat(spec.lines);//make a copy for the strategies to modify.
      var line;
      var command;
      var previousLength = lines.length;//use this to make sure strategies are shifting
      var previousStrategy;
      var previousLine;

      try {
        provider.program(lines, spec, specContext, compilerContext, argv);
        if(specContext.toString === ({}).toString){
          error = new errors.compiling.ProgramStrategyError(
            'Program must override specContext.toString!'
          );
        }
      } catch(e){error = e;}

      previousStrategy = 'program';


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

        provider[command](lines, spec, specContext, compilerContext, argv);

        previousStrategy = command;
        previousLine = line;
      }

      if(error)return false;
    });



    cb(error, specs);
  };
}
