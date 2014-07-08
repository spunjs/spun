'use strict';

var chalk = require('chalk');

module.exports = function specReporter(argv, cli){
  return function(err, context){
    if(err)
      cli.error(chalk.red('FAILED: ' + context.spec.path))
      , argv.verbose && cli.error(err.message)
      , argv.verbose && cli.error(context.output);
    else
      cli.praise(chalk.green('PASSED: ' + context.spec.path));
  };
};
