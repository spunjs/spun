#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var f = require('util').format;
var findupSync = require('findup-sync');
var glob = require('glob');
var isDir = require('is-dir');
var path = require('path');
var dirname = path.dirname;
var resolve = path.resolve;
var sutil = require('spun-util');
var help = require('../lib/help');
var run = require('../lib/run');
var MODULE_NAME = 'spun';
var cli = new sutil.CLI(MODULE_NAME);
var DEFAULT_GLOB = './test/**/*.' + MODULE_NAME;
var DEFAULT_WORKER_COUNT = 10;
var REAL_CWD = process.cwd();
var providerPackageJson;
var spunFiles = [];
var strategyProvider;

process.title = MODULE_NAME;

if(argv.h || argv.help) help(MODULE_NAME), exit(0);

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

if(parseInt(argv.workerCount))
  cli.log(f('Worker count set to %n.', argv.workerCount));
else
  argv.workerCount = DEFAULT_WORKER_COUNT;

if(!strategyProvider && argv.p)
  argv.p = resolve(argv.cwd, argv.p)
  , cli.log(f('Attempting to find a strategy provider starting at %s', argv.p))
  , strategyProvider = getProviderByArg('p', argv);

if(!strategyProvider && argv.provider)
  argv.provider = resolve(argv.cwd, argv.provider)
  , cli.log(f('Attempting to find a strategy provider starting at %s', argv.provider))
  , strategyProvider = getProviderByArg('provider', argv);

if(!strategyProvider)
  providerPackageJson = findupSync('package.json', {cwd: argv.cwd});

if(!strategyProvider && providerPackageJson)
  cli.log(f('Attempting to find a strategy provider in package.json located at %s', providerPackageJson))
  , strategyProvider = getProviderInPackageJson(providerPackageJson);

if(!strategyProvider)
  cli.error('No strategy provider found!')
  , argv.p && cli.error(f('  -p was %s', argv.p))
  , argv.provider && cli.error(f('  --provider was %s', argv.provider))
  , providerPackageJson && cli.error(f('  Searched this package.json file %s', providerPackageJson))
  , !argv.p && !argv.provider && !providerPackageJson && cli.error(
      f('Expected -p, --provider, or package.json to be found in %s or a parent directory.', argv.cwd)
    )
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
  try {
    return require(resolve(argv.cwd, argv[argName]));
  } catch(e) {
    cli.error(f('Unable to location provider using argv.%s = %s', argName, argv[argName]));
    cli.error(f('The following error occurred: %j', e));
  }
}

function getProviderInPackageJson(providerPackageJson){
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
    , provider = resolve(dirname(providerPackageJson), 'node_modules', providerName)
    , cli.log(f('Attempting to load it at %s', provider))
    , provider =  require(provider);

  return provider;
}

function toFullPath(path){
  return resolve(argv.cwd, path);
}

run(argv, spunFiles, strategyProvider, function(err){
  if(err) {
    cli.error('The following error occurred during run:');
    throw err;
  }
  cli.log('Finished!');
});
