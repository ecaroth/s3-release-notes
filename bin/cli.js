#! /usr/bin/env node
const 	Liftoff = require('liftoff'),
		Semver = require('semver'),
		Utils = require('./lib/utils.js'),
	  	path = require('path'),
	  	fs = require('fs');


const	packageJson = require('../package.json'), 			//s3-release-note app's package json defs
		appRootDir = require('app-root-path').path,			//root dir of the user's app
		availableCommands = Object.freeze([					//commands supported by the CLI
			'release',
			'preview',
			'current',
			'remove',
			'list'
		]);

var 	cmdValue = "release", 							//default sub command if none provided
		config = null									//config data as loaded from config file


//setup the commander program w/ version, opts, and fetch cmd
const program = require("commander")
		.version(packageJson.version)
		.option('-cf, --configfile <path>', 'Optional path to config file')
		.option('-av, --appversion <version>', 'Optional app version to address')
		.option('-d, --date <date>', 'Date to mark for operation', null)
		.option('-aws_key, --aws_access_key_id', 'AWS access key ID')
		.option('-aws_secret, --aws_secret_access_key', 'AWS secret key')
		.action((cmd, env) => {
			 cmdValue = cmd.toLowerCase();
			 if(availableCommands.indexOf(cmdValue) === -1){
			 	Utils.fatalError(`Invalid command [${cmdValue}] specified!`);
			 }
		});
program.parse(process.argv);


//TODO -add support for available sub commands (with descriptions!!)

//build Liftooff instance for the CLI app
const s3ReleaseNotes = new Liftoff({
	name: "s3-release-notes",
	processTitle: "s3-release-notes",
	moduleName: "s3-release-notes",
	configName: ".s3releasenotes",
	extensions: {
	    'rc': null
	  }
});

//load the package.json file for the project from the root dir
const loadProgramAppVersion = () => {
	try{
		var packageJson = require( path.relative(__dirname, appRootDir + "/package.json"));
	}catch(e){
		Utils.fatalError("No package.json file in project root!");
	}
	if(!packageJson.version) Utils.fatalError("Invalid package.json file - ne version present");
	program.appversion = packageJson.version;
}

//load and validate the config file
const loadAndValidateConfig = (configFilePath) => {
	try{
		config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
	}catch(e){
		Utils.fatalError(`Unable to load config file at ${configFilePath}!`);
	}
	if(!config.s3Bucket) Utils.fatalError("Invalid config file - no s3_bucket specified!");
};

//validate the provided or default app version
const validateAppVersion = () => {
	if(!Semver.valid(program.appversion)){
		Utils.fatalError("Invalid version - "+program.appversion+" is not valid semver!");
	}
}

//invocation function for the launcher
const invoke = (env) => {
	if(!env.configPath) return Utils.fatalError("No config file found!");
	
	if(!program.appversion) loadProgramAppVersion();
	
	loadAndValidateConfig(env.configPath);

	validateAppVersion();

	let opts = {
		awsAccessKeyId: program.aws_access_key_id || process.env.AWS_ACCESS_KEY_ID,
		awsSecretKey: program.aws_secret_access_key || process.env.AWS_SECRET_ACCESS_KEY,
		version: program.appversion,
		date: program.date
	};

	if(!opts.awsAccessKeyId || !opts.awsSecretKey) Utils.fatalError("Missing/invalid AWS access credentials supplied!");

	require(`./lib/${cmdValue}.js`).run(config, opts);
};

//initaalize Liftoff
s3ReleaseNotes.launch({
	configPath: program.configfile
}, invoke);