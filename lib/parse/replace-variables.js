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

      if(args.length > 0  && args[0].type === 'variable'){
        name = args[0].value;
        switch(command){
          case 'set':
            value = args[1].value;
            type = args[1].type;

            if(value && type === 'string'){
              vars[name] = h.stripQuotes(value);
            } else if(value && type === 'number'){
              vars[name] = parseInt(value);
            }
            return true;
          case 'submit':
          case 'click':
          case 'find':
          case 'get':
            type='string';
            break;
          case 'sleep':
            type='number';
            break;
        }
      }

      if(type && name)return handleVariable(type, name);

      function handleVariable(type, name){
        if(regex.variableName.test(name)){
          if(type === 'string'){
            if(typeof vars[name] !== 'string'){
              error = new errors.VariableReferenceError(name, 'string', typeof vars[name], line, lines);
              return false;
            }
            line.tokens[1].type = type;
            line.tokens[1].value = h.stripQuotes(vars[name]);
          } else {//number
            if(typeof vars[name] !== 'number'){
              error = new errors.VariableReferenceError(name, 'number', typeof vars[name], line, lines);
              return false;
            }
            line.tokens[1].type = type;
            line.tokens[1].value = vars[name];
          }
        }
        return true;
      }

      return true;
    });

    return true;
  });

  setImmediate(cb, error || null, specs);
}
