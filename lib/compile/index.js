'use strict';

module.exports = compile;

var errors = require('./errors');

function compile(argv, Provider){
  return function(specs, cb){
    var error = null;

    specs.every(function(spec){
      var remainingLines = [].concat(spec.lines);//make a copy for the strategies to modify.
      var line;
      var previousLines = [];//after we shift a line we'll append it here.
      var command;
      var provider = new Provider(argv);

      while(!error && remainingLines.length){
        line = remainingLines.shift();
        command = line.command;

        //commands the compiler should ignore
        switch(command){
          case 'include':
            continue;
        }

        if(!provider[command]){
          error = new errors.MissingStrategyError(command);
          break;
        }


        provider[command](line, previousLines, remainingLines);

        previousLines.push(line);
      }

      if(error)return false;

      spec.compiled = provider.toString();

      return true;
    });

    return setImmediate(cb, error, specs);
  };
}
