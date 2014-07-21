'use strict';

module.exports = replaceVariables;

var sutil = require('spun-util');
var regex = sutil.regex;
var errors = require('./errors');
var h = require('../helpers');

function replaceVariables(specs, cb){
  var error;
  specs.every(function(spec){
    var vars = spec.variables;
    var lines = spec.lines;

    lines.every(function(line){
      var command = line.tokens[0].value;
      var args = line.tokens.slice(1); 
      var name;
      var value;
      var type;

      if(command === 'set'){
        name = args[0].value;
        value = args[1].value;
        type = args[1].type;
        vars[name] = {
          value: value,
          type: type
        };
      } else {
        return args.every(function (arg, index){
          var name, variable;
          if(arg.type === 'variable'){
            name = arg.value;
            variable = vars[name];
            if(!variable){
              error = new errors.VariableReferenceError(line, name);
              return false;
            }
            arg.value = variable.value;
            arg.type = variable.type;
          }

          return true;
        });
      }

      return true;
    });

    return true;
  });

  setImmediate(cb, error || null, specs);
}
