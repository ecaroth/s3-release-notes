#! /usr/bin/env node
const 	Liftoff = require('liftoff'),
		Semver = require('semver'),
		Utils = require('./lib/utils.js'),
	  	path = require('path');


const	packageJson = require('../package.json'), 		//s3-release-note app's package json defs
		appRootDir = require('app-root-dir').get();		//root dir of the user's app
var 	cmdValue = "release", 							//default sub command if none provided
		config = null									//config data as loaded from config file


//setup the commander program w/ version, opts, and fetch cmd
const program = require("commander")
		.version(packageJson.version)
		.option('-cf, --configfile <path>', 'Optional path to config file')
		.option('-av, --appversion <version>', 'Optional app version to address')
		.option('-d, --date <date>', 'Date to mark for operation', null)
		.action(function (cmd, env) {
			 cmdValue = cmd;
		});
program.parse(process.argv);


//TODO -add support for available sub commands (with descriptions!!)

//build Liftooff instance for the CLI app
const s3ReleaseNotes = new Liftoff({
	name: "s3-release-notes",
	processTitle: "s3-release-notes",
	moduleName: "s3-release-notes",
	configFiles: {
	    '.s3ReleaseNotes': {
	      up: {
	        path: '.',
	        findUp: true
	      }
	    }
	}
});

//load the package.json file for the project from the root dir
const loadProgramAppVersion = function(){
	try{
		var packageJson = require( path.relative(__dirname, appRootDir + "/package.json"));
	}catch(e){
		Utils.fatalError("No package.json file in project root!");
	}
	if(!packageJson.version) Utils.fatalError("Invalid package.json file - ne version present");
	program.appversion = packageJson.version;
}

//load and validate the config file
const loadAndValidateConfig = function(configFilePath){
	config = require(configFilePath);
	if(!config.s3_bucket) Utils.fatalError("Invalid config file - no s3_bucket specified!");
};

//validate the provided or default app version
const validateAppVersion = function(){
	if(!Semver.valid(program.appversion)){
		Utils.fatalError("Invalid version - "+program.appversion+" is not valid semver!");
	}
}

//invocation function for the launcher
const invoke = function (env) {
	if(!env.configPath) return Utils.fatalError("No config file found!");
	
	if(!program.appversion) loadProgramAppVersion();
	
	loadAndValidateConfig(env.configPath);

	validateAppVersion();

	switch(cmdValue){
		case 'release':
			require("./lib/release.js").run(config, program.appversion, program.date);
			break;
		case 'preview':
			require("./lib/preview.js").run(config, program.appversion);
			break;
		case 'current':
			require("./lib/current.js").run(config);
			break;
		case 'remove':
			require("./lib/remove.js").run(config, program.appversion);
			break;
		case 'list':
			require("./lib/list.js").run(config);
			break;
	}
};

//initaalize Liftoff
s3ReleaseNotes.launch({
	configPath: program.configfile
}, invoke);
