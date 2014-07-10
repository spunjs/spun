#!/usr/bin/env node

var async = require('async');
var argv = require('minimist')(process.argv.slice(2), {
  boolean: ['verbose']
});
var f = require('util').format;
var h = require('../lib/helpers');
var findupSync = require('findup-sync');
var glob = require('glob');
var isDir = require('is-dir');
var path = require('path');
var basename = path.basename;
var dirname = path.dirname;
var resolve = path.resolve;
var sutil = require('spun-util');
var errors = sutil.errors;
var help = require('../lib/help');
var MODULE_NAME = 'spun';
var cli = new sutil.CLI(MODULE_NAME);
var DEFAULT_PROVIDER_NAME = 'spun-webdriver-sync';
var DEFAULT_PROVIDER_PATH = resolve(__dirname, '..', 'node_modules', 'spun-webdriver-sync');
var DEFAULT_GLOB = './test/**/*.' + MODULE_NAME;
var DEFAULT_WORKER_COUNT = 10;
var REAL_CWD = process.cwd();
var providerPackageJson;
var spunFiles = [];
var provider;
var providerPath;
var spunTasks;
var allowedBrowsers = 'chrome,ff,ie,opera,phantom,afari'.split(',');
var reporter = require('../lib/reporters/spec');

process.title = MODULE_NAME;

if(argv.h || argv.help) help(MODULE_NAME), exit(0);

if(argv.v) argv.verbose = true;

if(argv.version)
  cli.log(require('../package.json').version)
  , exit();

if(argv.browsers)
  if(argv.browsers.split(',').filter(function(browser){return allowedBrowsers.indexOf(browser) === -1;}).length)
    cli.error('--browsers argument only accepts chrome, ff, ie, opera, phantom, or safari.')
    , exit(1);
  else argv.browsers = argv.browsers.split(',');
else
  cli.log('No --browsers given, defaulting to chrome.')
  , argv.browsers = ['chrome'];

if('cwd' in argv){
  argv.cwd = resolve(argv.cwd);
  if(!isDir(argv.cwd)){
    cli.warn(argv.cwd + ' was not a directory.  Changing to ' + REAL_CWD);
  } else {
    cli.log('Changing current directory to  "' + argv.cwd + '"');
  }
} else {
  argv.cwd = REAL_CWD;
}

argv.workerCount = parseInt(argv['worker-count']);
if(argv.workerCount)
  cli.log(f('Worker count set to %s.', argv.workerCount));
else
  argv.workerCount = DEFAULT_WORKER_COUNT;

if(!provider && argv.p)
  argv.p = resolve(argv.cwd, argv.p)
  , cli.log(f('Attempting to find a strategy provider starting at %s', argv.p))
  , provider = getProviderByArg('p', argv);

if(provider)argv.provider = argv.p;

if(!provider && argv.provider)
  argv.provider = resolve(argv.cwd, argv.provider)
  , cli.log(f('Attempting to find a strategy provider starting at %s', argv.provider))
  , provider = getProviderByArg('provider', argv);

if(!provider)
  providerPackageJson = findupSync('package.json', {cwd: argv.cwd});

if(!provider && providerPackageJson)
  cli.log(f('Attempting to find a strategy provider in package.json located at %s', providerPackageJson))
  , providerPath = getProviderPathFromPackageJson(providerPackageJson);

if(!provider)
  cli.log(f('Using the default provider ', DEFAULT_PROVIDER_NAME))
  , providerPath = DEFAULT_PROVIDER_PATH;

if(providerPath)
  cli.log(f('Attempting to load provider at %s', providerPath))
  , provider = require(providerPath);

if(provider)argv.provider = providerPath;

if(!provider)
  cli.error('No strategy provider found!')
  , argv.p && cli.error(f('  -p was %s', argv.p))
  , argv.provider && cli.error(f('  --provider was %s', argv.provider))
  , providerPackageJson && cli.error(f('  Searched this package.json file %s', providerPackageJson))
  , !argv.p && !argv.provider && !providerPackageJson && cli.error(
      f('Expected -p, --provider, or package.json to be found in %s or a parent directory.', argv.cwd)
    )
  , exit(1);

if(typeof provider !== 'function')
  cli.error('A strategy provider must be instantiable.')
  , exit(1);

if(argv._.length){
  argv._.forEach(function(pattern){
    spunFiles = spunFiles.concat(glob.sync(pattern, {cwd: argv.cwd}));
  });
} else spunFiles = glob.sync(DEFAULT_GLOB, {cwd: argv.cwd});

spunFiles = spunFiles.filter(byExtensions).map(toFullPath);

if(!spunFiles.length){
  if(argv._.length){
    cli.error(f('Couldn\'t find any ".%s" files using the following glob patterns: %j', MODULE_NAME,  argv._));
  } else {
    cli.error(f('No ".%s" files found using the default glob: %s', MODULE_NAME,  DEFAULT_GLOB));
  }
  exit(1);
}

if(argv.runner === 'false' || argv.r === 'false')
  delete argv.runner
  , delete argv.r
  , cli.log('--runner set to false.  Not running compiled spun files.');
else {
  if(typeof argv.runner !== 'string' && typeof argv.r === 'string')argv.runner = argv.r;
  else argv.runner = 'node';
}

function byExtensions(path){
  return path.indexOf('.' + MODULE_NAME) === path.length - MODULE_NAME.length - 1;
}

function byNamePrefix(name){
  return name.indexOf('spun-') === 0 && name.indexOf('spun-util') === -1;
}

function exit(code){
  if(code){
    cli.error(f('Run `%s -h` for usage.', MODULE_NAME));
  }
  process.exit(parseInt(code) || 0);
}

function getProviderByArg(argName, argv){
  var provider;
  var fullPath = resolve(argv.cwd, argv[argName]);
  try {
    provider = require(fullPath);
    cli.log(f('Found %s at %s', basename(fullPath), fullPath));
  } catch(e) {
    console.log(e);
    cli.error(f('Unable to locate provider using argv.%s = %s', argName, argv[argName]));
    cli.error(f('The following error occurred: %j', e));
  }
  return provider;
}

function getProviderPathFromPackageJson(providerPackageJson){
  var json = require(providerPackageJson);
  var dependencies = json.dependencies;
  var devDependencies = json.devDependencies;
  var peerDependencies = json.peerDependencies;
  var providerName;
  var provider;

  if(dependencies)
    providerName = Object.keys(dependencies)
    .filter(byNamePrefix)[0];

  if(!providerName && peerDependencies)
    providerName = Object.keys(peerDependencies)
    .filter(byNamePrefix)[0];

  if(!providerName && devDependencies)
    providerName = Object.keys(devDependencies)
    .filter(byNamePrefix)[0];

  if(providerName)
    cli.log(f('Found %s in %s', providerName, providerPackageJson))
    , provider = resolve(dirname(providerPackageJson), 'node_modules', providerName);

  return provider;
}

function toFullPath(path){
  return resolve(argv.cwd, path);
}

spunTasks = [
  require('../lib/parse')(argv, spunFiles),
  require('../lib/compile')(argv, provider)
];

if(argv.runner)spunTasks.push(require('../lib/run')(argv, reporter(argv, cli)));

async.waterfall(spunTasks, function(err, contexts){
  contexts = contexts || [];
  var failures = contexts.filter(h.byProp('error')).length;
  var method = 'praise';
  if(err) {
    if(err instanceof errors.SpunError){
      cli.error(f('%s: %s', err.constructor.super_.name, err.message));
      if(err.stack){
        err.stack.forEach(function(entry){
          cli.error('|  ' + entry);
        });
      }
    } else {
      cli.error(err.message);
      if(err.stack) console.error(err.stack);
    }
  }
  if(err || failures) method = 'error';

  cli[method](f('FINISHED!  %s passed %s failed', contexts.length - failures, failures));

  if(method === 'error' && !argv.verbose) cli.error('Run with --verbose to see the full output.');
});
