'use strict';
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
    program.push('sample: ' + args.amount);
  };

  this.submit = function(args, line, spec){
    program.push('sample: "' + args.query + '"');
  };

  this.toString = function(){
    return program.toString();
  };
};
