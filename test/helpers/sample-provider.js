'use strict';

var composites = require('composites');
var Program = composites.Program;
var CompositeString = composites.CompositeString;

module.exports = function(argv){
  var program = new Program();

  this.get = function(line, previousLines, remainingLines){
    program.push('sample: ' + line.args);
  };

  this.quit = function(line, previousLines, remainingLines){
    program.push('sample: quit');
  };

  this.toString = function(){
    return program.toString();
  };
};
