'use strict';

var chalk = require('chalk');

module.exports = function specReporter(cli){
  return function(err, context){
    if(err)
      cli.error(chalk.red('FAILED: ' + context.spec.path))
      , cli.error(err.message)
      , cli.error(context.output);
    else
      cli.praise(chalk.green('PASSED: ' + context.spec.path));
  };
};
