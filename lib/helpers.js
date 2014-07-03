'use strict';

[
  addCommandProperty,
  addFileProperty,
  byCommand,
  byNonEmptyLine,
  bySpecsWithIncludes,
  createReadContext,
  hasMixinDeclaration,
  hasNoArgs,
  next,
  not,
  stripArgQuotes,
  toLine
].forEach(addToExports);

var sutil = require('spun-util');
var errors = sutil.errors;
var regex = sutil.regex;
var path = require('path');
var extname = path.extname;
var resolve = path.resolve;
var dirname = path.dirname;
var basename = path.basename;

function addToExports(fn){
  module.exports[fn.name] = fn;
}

function addCommandProperty(line){
  var commandMatch = regex.command.exec(line.text);
  var command;
  var params;

  if(commandMatch){
    line.command = commandMatch[1];
    line.args = (commandMatch[2] || '').trim();
  }
  return line;
}

function addFileProperty(path){
  return function(line){
    line.file = path;
    return line;
  };
}

function byCommand(name){
  return function(line){
    return line.command === name;
  };
}

function byNonEmptyLine(line){
  return line.text && line.text.replace(regex.emptyLines, '');
}

function bySpecsWithIncludes(spec){
  return !!spec.lines.filter(byCommand('include')).length;
}

function createReadContext(path, ancestors){
  ancestors = Array.isArray(ancestors) ? ancestors : [];
  ancestors.push(path);//we don't care about duplicates here

  return {
    path: path,
    ancestors: ancestors
  };
}

function hasMixinDeclaration(line){
  return line.command === 'mixin';
}

function hasNoArgs(line){
  return !line.args;
}

function next(err, result, cb){
  process.nextTick(function(){
    cb(err, result);
  });
}

function not(fn){
  return function(item){
    return fn(item);
  };
}

function stripArgQuotes(line){
  line.args = line.args.replace(regex.stringQuotes, '');
}

function toLine(line, i){
  return {
    command: '',
    args: '',
    file: '',
    number: i + 1,
    text: line
  };
}

function unwrapQuotedArgs(line){
  line.args = line.args.replace(regex.stringQuotes, '');
}
