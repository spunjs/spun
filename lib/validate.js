'use strict';

module.exports = validate;

var h = require('./helpers');
var sutil = require('spun-util');
var errors = sutil.errors;
var regex = sutil.regex;
var allowedCommands = 'click,close,find,get,include,quit,refresh,sleep'.split(',');

function validate(specs, cb){
  var error;
  var allSpecsPassed = !!specs.every(function(spec){
    var lines = spec.lines;
    var hasGetCommand;

    return !!lines.every(function(line, index){
      var command = line.command;
      var args = line.args;

      if(allowedCommands.indexOf(command) === -1){//bail early
        error = new errors.validating.ValidationError(
          lines,
          line,
          'Unknown command ' + command
        );
        return false;
      }

      //bail on commands we know to be valid.
      switch(command){
        case 'include':
          return true;
      }

      //ensuring we have a browser open for certain commands
      switch(command){
        //these don't need or don't care that a browser is open
        case 'sleep':
          break;
        case 'get':
          hasGetCommand = true;
          break;
        //these need a browser open, but they don't necessarily close it
        case 'click':
        case 'find':
        case 'refresh':

        //these both need a browser open _and_ they close it.
        case 'close':
        case 'quit':
          if(hasGetCommand){
            //if we have a browser open continue.
            if('click,find,refresh'.indexOf(command) > -1)break;
            hasGetCommand = false;
          } else error = new errors.validating.ValidationError(
            lines,
            line,
            'Expected to see a get request before ' + command
          );
          break;
      }

      //numeric arguments
      switch(command){
        case 'sleep':
          if(/[0-9]+/.test(args))return true;
          error = new errors.validating.ValidationError(
            lines,
            line,
            'Expected a numeric argument.'
          );
      }

      //string arguments
      switch(command){
        case 'click':
        case 'find':
        case 'get':
          if(regex.string.test(args))return true;
          error = new errors.validating.ValidationError(
            lines,
            line,
            'Expected a string argument.'
          );
      }

      if(error)return false;
      return true;
    });
  });

  return h.next(error, specs, cb);
}
