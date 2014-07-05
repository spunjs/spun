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
    f('  Usage: %s [--cwd dir] [-p name, --provider name] [-r [runner], --run [runner]] [%s...]', name, GLOBS),
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
    '  --browsers browsers',
    '    A comma separated list of browsers I.E. chrome,ff,ie,opera,phantom,safari',
    '',
    '  -p <provider>, --provider <provider>',
    '     Use the given provider when compiling files.  It may be a relateive path or an absolute path.  By default "package.json" in the cwd will be scanned for the first dependency prefixed with "spun-" whose name does not equal "spun-util".',
    '',
    '  -r [runner], --runner [runner]',
    '    When this option is given, spun will pipe compiled spun files to runner.  By default the runner is node.  If you do not wish to run any of the compiled spec files then provide false as the runner.',
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

