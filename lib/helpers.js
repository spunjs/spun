'use strict';

[
  addFileProperty,
  byCommand,
  byNoArgs,
  byNonEmptyLine,
  byProp,
  bySpecsWithUnresolvedIncludes,
  bySingleArg,
  clone,
  createReadContext,
  hasMixinDeclaration,
  hasNoArgs,
  not,
  toProperty,
  toLine,
].forEach(addToExports);

var sutil = require('spun-util');
var regex = sutil.regex;
var path = require('path');
var extname = path.extname;
var resolve = path.resolve;
var dirname = path.dirname;
var basename = path.basename;

function addToExports(fn){
  module.exports[fn.name] = fn;
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

function byNoArgs(line){
  return line.tokens.length === 1;
}

function byNonEmptyLine(line){
  return line.text && line.text.replace(regex.emptyLines, '');
}

function byProp(prop, val){
  var testVal = arguments.length > 1;
  return function(line){
    if(testVal)return line[prop] === val;
    else return prop in line;
  };
}

function bySpecsWithUnresolvedIncludes(spec){
  return !!spec.lines.filter(byCommand('include')).filter(byProp('includeResolved', false)).length;
}

function bySingleArg(token){
  return function(line){
    return line.tokens.length === 2 && line.tokens[0].type === token;
  };
}

function clone(line){
  return {
    command: line.command,
    file: line.file,
    includePath: line.includePath,
    number: line.number,
    tokens: line.tokens.concat(),
    text: line.text
  };
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
  return line.tokens.length === 1;
}

function not(fn){
  return function(item){
    return !fn(item);
  };
}

function toLine(line, i){
  return {
    command: '',
    file: '',
    includeResolved: false,//used to test if an include has been resolved
    number: i + 1,
    text: line,
    tokens: []
  };
}

function toProperty(prop){
  return function(obj){
    return obj[prop];
  };
}
