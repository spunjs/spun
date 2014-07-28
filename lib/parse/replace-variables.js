'use strict';

module.exports = replaceVariables;

var sutil = require('spun-util');
var regex = sutil.regex;
var errors = require('./errors');
var h = require('../helpers');
var f = require('util').format;
var packageJson = require('../../package.json');
var cli = new sutil.CLI('spun');

function replaceVariables(defaultVariables){
  return function(specs, cb){
    var error = null;
    specs.every(function(spec){
      var vars = {};
      var lines = spec.lines;

      if(defaultVariables)vars = mapDefaults(defaultVariables);

      return lines.every(function(line){
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
          return true;
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
      });
    });

    setImmediate(cb, error, specs);
  };
}

function mapDefaults(defaults){
  var finalObject = {};

  Object.keys(defaults).forEach(function(key){
    var value = defaults[key];
    var type = typeof value;

    switch(type){
      case 'number':
        finalObject[key] = {type: type, value: value};
        break;
      case 'string':
        finalObject[key] = {type: type, value: f('"%s"', value.replace(/"/g, '\\"'))};
        break;
      default:
        cli.warn(f('Unknown data type %s in variables for value %s.', type, value));
        cli.warn('Only strings and numbers are supported at this time.');
        cli.warn(f('Please reach out to %s if you would like to have this type supported.', packageJson.bugs.url));
    }
  });

  return finalObject;
}
