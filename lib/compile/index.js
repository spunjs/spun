'use strict';

module.exports = compile;

var errors = require('./errors');

function compile(argv, Provider){
  return function(specs, cb){
    var error = null;

    specs.every(function(spec){
      var provider = new Provider(argv);
      var lines = spec.lines;

      lines.every(function(line){
        var command = line.command;
        var args = line.args;

        //commands the compiler should ignore
        switch(command){
          case 'include':
          case 'set':
            return true;
        }

        if(!provider[command]){
          error = new errors.MissingStrategyError(command);
          return false;
        }

        provider[command](args, line, spec);

        return true;
      });

      if(!error)spec.compiled = provider.toString();

      return true;
    });

    return setImmediate(cb, error, specs);
  };
}
