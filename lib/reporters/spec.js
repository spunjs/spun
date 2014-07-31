'use strict';

var chalk = require('chalk');
var basename = require('path').basename;

module.exports = function specReporter(argv, cli){
  return function(err, context){
    var browser = context.browser;
    if(err)
      cli.error(chalk.red(prefixed(browser) + prettyName(context.spec.path)))
      , argv.verbose && cli.error(err.message)
      , argv.verbose && cli.error(context.output);
    else
      cli.praise(chalk.green(prefixed(browser) + prettyName(context.spec.path)));
  };
};

function prefixed(prefix){
  return prefix + '          :  '.substring(prefix.length);
}

function prettyName(path){
  return basename(path, '.spun').replace(/[^a-z0-9]/g, ' ');
}
