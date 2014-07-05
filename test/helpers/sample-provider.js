'use strict';

var composites = require('composites');
var Program = composites.Program;
var CompositeString = composites.CompositeString;

module.exports = function(argv){
  var program = new Program();

  this.get = function(lines){
    var line = lines.splice(0, 1)[0];

    program.push('sample: ' + line.args);
  };

  this.toString = function(){
    return program.toString();
  };
};
