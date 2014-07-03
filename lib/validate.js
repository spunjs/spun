'use strict';

module.exports = validate;

var h = require('./helpers');
var sutil = require('spun-util');
var errors = sutil.errors;
var allowedCommands = 'click,close,find,get,include,quit,refresh,sleep'.split(',');

function validate(specs, cb){
  var error;
  var allSpecsPassed = !!specs.every(function(spec){
    var lines = spec.lines;
    var hasGetCommand;

    return !!lines.every(function(line, index){
      var command = line.command;

      if(allowedCommands.indexOf(command) === -1){//bail early
        error = new errors.validating.ValidationError(
          lines,
          line,
          'Unknown command ' + command
        );
        return false;
      }


      //ensuring we have a browser open for certain commands
      switch(line.command){
        case 'get':
          hasGetCommand = true;
          break;
        case 'include':
        case 'sleep':
          break;
        case 'click':
        case 'find':
        case 'refresh':

        case 'close':
        case 'quit':
          if(hasGetCommand){
            if('click,find,refresh'.indexOf(command) > -1)break;
            hasGetCommand = false;
          } else error = new errors.validating.ValidationError(
            lines,
            line,
            'Expected to see a get request before ' + command
          );
          break;
      }
      if(error)return false;
      return true;
    });
  });

  return h.next(error, specs, cb);
}
