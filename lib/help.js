'use strict';

var chalk = require('chalk');
var f = require('util').format;

module.exports = help;

function help(name){
  var GLOBS = chalk.bold.underline('GLOBS');
  var SYNOPSIS = chalk.bold.underline('SYNOPSIS');
  var OPTIONS = chalk.bold.underline('OPTIONS');

  console.log([
    '',
    chalk.bold.underline(name),
    '',
    f('  Usage: %s [--cwd dir] [-p, --provider name] %s...', name, GLOBS),
    '',
    SYNOPSIS,
    '',
    f('  %s compiles selenium %s files.', name, name),
    '',
    OPTIONS,
    '',
    '  -h --help',
    '',
    '    Print this menu.',
    '',
    '  --cwd dir',
    f('    The cwd to resolve %s against.  By default process.cwd() will be used.', GLOBS),
    '',
    '  -p <provider>, --provider <provider>',
    '     Use the given provider when compiling files.  It may be a relateive path or an absolute path.  By default "package.json" in the cwd will be scanned for the first dependency prefixed with "spun-" whose name does not equal "spun-util".',
    '',
    '  --worker-count <number>',
    '    The number of workers to use when reading, writing, and or executing files.  The default value is 10.',
    '',
    GLOBS,
    '',
    f('  An array of glob patterns.  By default, "./test/**/*.%s" will be used.  All %s are resolved against the value of --cwd.', name, GLOBS),
    ''
  ].join('\n'));
}

