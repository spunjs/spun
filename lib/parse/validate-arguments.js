'use strict';

module.exports = validateArguments;

var allowedArgs = {
  'click':   /^(?:string|variable)?$/,
  'close':   null,
  'find':    /^(?:string|variable)$/,
  'get':     /^(?:string|variable)$/,
  'include': /^string$/,
  'quit':    null,
  'refresh': null,
  'set':     /^variable,(?:number|string)$/,
  'sleep':   /^(?:number|variable)$/,
  'submit':  /^(?:string|variable)?$/
};
var errors = require('./errors');

function validateArguments(specs, cb){
  var error = null;

  specs.every(function(spec){
    return spec.lines.every(function(line){
      var tokens = line.tokens;
      var command = tokens[0].value;
      var args = tokens.slice(1);
      var argTypes = args.map(toType).join(',');
      var argRegex = allowedArgs[command];

      if(!argRegex){
        if(args.length){
          error = new errors.UnexpectedArgumentError(line, command);
          return false;
        }
        return true;
      }

      if(!argRegex.test(argTypes)){
        if (!args.length) {
          error = new errors.MissingArgumentError(line, command);
          return false;
        }
        error = new errors.InvalidArgumentError(line, argRegex.source, argTypes);
        return false;

      }
      return true;
    });
  });

  cb(error, specs);
}

function toType(token){
  return token.type;
}
