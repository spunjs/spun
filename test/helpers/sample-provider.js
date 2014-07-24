'use strict';
var assert = require('assert');
var composites = require('composites');
var Program = composites.Program;
var CompositeString = composites.CompositeString;

module.exports = function(argv){
  var program = new Program();

  this.click = function(args, line, spec){
    program.push('sample: "' + args.query + '"');
  };

  this.find = function(args, line, spec){
    program.push('sample: "' + args.query + '"');
  };

  this.get = function(args, line, spec){
    program.push('sample: "' + args.url + '"');
  };

  this.quit = function(args, line, spec){
    program.push('sample: quit');
  };

  this.sleep = function(args, line, spec){
    assert('number', typeof args.amount);
    program.push('sample: ' + args.amount);
  };

  this.submit = function(args, line, spec){
    program.push('sample: "' + args.query + '"');
  };

  this.type = function(args, line, spec){
    if(args.query)
      program.push('sample: type ' + '"' + args.text  + '" in "' + args.query + '"');
    else
      program.push('sample: type ' + '"' + args.text + '"');
  };

  this.toString = function(){
    return program.toString();
  };
};
