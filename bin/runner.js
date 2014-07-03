'use strict';

(function(e){
  var errors = require('./errors/running');
  var argv = require('minimist')(process.argv.slice(2));

  if(!argv.script)return process.exit(errors.NO_SCRIPT_GIVEN);
  e(new Buffer(argv.script, 'base64').toString('utf-8'));
})(eval);
