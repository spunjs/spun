'use strict';

module.exports = addArgContextToLines;

var stripQuotes = require('../helpers').stripQuotes;

function addArgContextToLines(specs, cb){
  specs.forEach(function(spec){
    var lines = spec.lines;
    lines.forEach(function(line){
      var command = line.command;
      var args = line.args = {};
      var tokens = line.tokens;

      switch(command){
        case 'click':
        case 'find':
        case 'submit':
          if(tokens[1])args.query = stripQuotes(tokens[1].value);
          break;
        case 'get':
          args.url = stripQuotes(tokens[1].value);
          break;
        case 'sleep':
          args.amount = parseInt(tokens[1].value);
          break;
        case 'type':
          args.text = stripQuotes(tokens[1].value);
          if(tokens[3])args.query = stripQuotes(tokens[3].value);
          break;
      }
    });
  });

  cb(null, specs);
}
