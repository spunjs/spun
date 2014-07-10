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
      var command = line.command;
      var args = line.args;
      var name;
      var value;
      var type;

      switch(command){
        case 'set':
          args = args.split(/\s+/);
          name = args[0];
          value = args[1];
          if(!regex.variableName.test(name)){
            error = new errors.InvalidVariableNameError(line, lines);
            return false;
          }
          if(value && regex.string.test(value)){
            vars[name] = regex.string.exec(value)[1];
          } else if(value && regex.number.test(value)){
            vars[name] = parseInt(value);
          } else {
            error = new errors.InvalidVariableValueError(line, lines);
            return false;
          }

          return true;
        case 'click':
        case 'find':
        case 'get':
          name = line.args;
          type='string';
          break;
        case 'sleep':
          name = line.args;
          type='number';
          break;
      }

      if(type && name && regex.variableName.test(name)){
        if(type === 'string'){
          if(typeof vars[name] !== 'string'){
            error = new errors.VariableReferenceError(name, 'string', typeof vars[name], line, lines);
            return false;
          }
          line.args = '"' + vars[name] + '"';
        } else {//number
          if(typeof vars[name] !== 'number'){
            error = new errors.VariableReferenceError(name, 'number', typeof vars[name], line, lines);
            return false;
          }
          line.args = vars[name];
        }
      }

      return true;
    });

    spec.lines = lines.filter(h.not(h.byCommand('set')));
  });

  setImmediate(cb, error || null, specs);
}