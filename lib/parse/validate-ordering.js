'use strict';

module.exports = validate;

var sutil = require('spun-util');
var errors = require('./errors');
var h = require('../helpers');
var regex = sutil.regex;

function validate(specs, cb){
  var error = null;

  specs.every(function(spec){
    var lines = spec.lines;
    var hasGetCommand;
    var followsGetCommand;
    var addedQuitCommand;
    var hasFind;
    var hasInclude;
    var linesValidated = lines.every(function(line, index){
      var command = line.tokens[0].value;
      var args = line.tokens.slice(1);

      //bail on commands we know to be valid.
      switch(command){
        case 'include':
        case 'set':
          return true;
      }

      //ensuring we have a browser open for certain commands
      switch(command){
        //these don't need or don't care that a browser is open
        case 'sleep':
          break;
        case 'get':
          hasGetCommand = true;
          followsGetCommand = true;
          break;
        //these need a browser open, but they don't necessarily close it
        case 'click':
        case 'find':
        case 'refresh':
        case 'type':

        //these both need a browser open _and_ they close it.
        case 'close':
        case 'quit':
          if(followsGetCommand){
            //if we have a browser open continue.
            if('click,find,refresh'.indexOf(command) > -1)break;
            followsGetCommand = false;
          } else  
            error = new errors.NeedsGetCommandError(
            line,
            lines
          );
          break;
      }

      //handling find for certain commands
      switch(command){
        case 'find':
          hasFind = true;
          break;
        case 'close':
        case 'quit':
        case 'get':
         hasFind = false;
         break;
      }

      //string arguments
      switch(command){
        case 'type':
          if(args.length === 1 && hasFind)return true;

          if((args.length === 3) &&
             (args[2].type === 'string')) {
               return true;
          } else {
            error = new errors.RequiresStringArgumentError(
                line,
                lines
            );
          }
          break;
        case 'click':
        case 'submit':
          if(hasFind){
            break;
          }
          /*falls through*/
        case 'find':
        case 'get':
          if(args.length > 0 && args[0].type === 'string')return true;
          error = new errors.RequiresStringArgumentError(
            line,
            lines
          );
          break;
      }

      if(error)return false;
      return true;
    });

    if(!hasGetCommand)error = new errors.NoGetCommandInSpecError(spec);

    if(followsGetCommand && !error){
      addedQuitCommand = h.toLine('quit', NaN);
      addedQuitCommand.command = 'quit';
      addedQuitCommand.file = spec.path;
      lines.push(addedQuitCommand);
    }
    return linesValidated && !error;
  });

  return setImmediate(cb, error, specs);
}
