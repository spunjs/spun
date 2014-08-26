'use strict';

[
  addFileProperty,
  byCommand,
  byNonEmptyLine,
  byProp,
  bySpecsWithUnresolvedIncludes,
  clone,
  createReadContext,
  stripQuotes,
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

function byNonEmptyLine(line){
  return line.text && line.text.replace(regex.emptyLines, '');
}

function byProp(prop, val){
  var testVal = arguments.length > 1;
  return function(line){
    if(testVal)return line[prop] === val;
  };
}

function bySpecsWithUnresolvedIncludes(spec){
  return !!spec.lines.filter(byCommand('include')).filter(byProp('includeResolved', false)).length;
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

function createReadContext(path, includedFiles){
  includedFiles = Array.isArray(includedFiles) ? includedFiles : [];
  includedFiles.push(path);//we don't care about duplicates here

  return {
    path: path,
    includedFiles: includedFiles
  };
}

function stripQuotes(str) {
  if(typeof str === 'string' && str.charAt(0) === '"' && str.charAt(str.length-1) === '"')
    return str.substring(1, str.length-1);
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
