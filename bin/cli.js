#! /usr/bin/env node

var ArgumentParser = require('argparse').ArgumentParser,
	Joi = require('joi'),
	Readline = require('readline'),
	Semver = require('semver'),
	app_dir = require('app-root-dir').get(),
	pkg_json = require('../package.json'),
	app_pkg_json = null,		//appliction's package.json file from app root dir
	config = null,				//.s3ReleaseNotes config object in app root dir
	args = null,
	cmdln_input = null;	

//Joi schema definitions for s3ReleaseNotes config & project package.json
const 	config_schmea = Joi.object().keys({
			s3_bucket: Joi.string().required()
		}),
		package_schema = Joi.object().keys({
			version: Joi.string().required(),
			name: Joi.string().required()
		});

const 	SCHEMA_VOPTS = { allowUnknown: true, stripUnknown: true },
		DEFAULT_CONFIG_FILE_PATH = app_dir + "/.s3ReleaseNotes";

function fatal_err(){
	arguments[0] = "ERROR - " + arguments[0];
	console.error.apply(this, arguments);
	process.exit();
}


//read the .s3ReleaseNotes config file and validate
function load_config_data(){
	var fpath = args.config || DEFAULT_CONFIG_FILE_PATH;
	try{
		config = require(fpath);
	}catch(e){
		fatal_err("No config file at " + fpath);
	}
	Joi.validate(config, config_schmea, SCHEMA_VOPTS, function (err, value) { 
		if(err){
			fatal_err("Invalid config file at " + fpath, err.ValidationError);
		}
	});
}

//set the arguments parser & sub commands with ArgumentParser
function setup_parser_and_commands(){
	var parser = new ArgumentParser({
	  prog: "s3-release-notes",
	  version: app_pkg_json.version,
	  addHelp:true,
	  description: 's3-release-notes examples: sub-commands',
	});
	
	var subparsers = parser.addSubparsers({
	  title:'subcommands',
	  dest:"subcommand_name"
	});

	var release_parser = subparsers.addParser('release', {}),
		remove_parser = subparsers.addParser('remove', {}),
		preview_parser = subparsers.addParser('preview', {}),
		current_parser = subparsers.addParser('current', {}),
		avl_args = [
			[ ['-av','--appversion'], {help: "App version to apply command for (defaults to current version in package.json"}],
			[ ['-c','--config'], {help: "Alternative config file (instead of .s3ReleaseNotes)"}]
		];

	//add date param to release parser
	release_parser.addArgument(['-d','--date'], {help: "Date to set as release date (default is today's date if not provided or previously set)"});
	//add other arguments
	avl_args.forEach(function(arg){
		release_parser.addArgument(arg[0], arg[1]);
		remove_parser.addArgument(arg[0], arg[1]);
		preview_parser.addArgument(arg[0], arg[1]);
		current_parser.addArgument(arg[0], arg[1]);
	});

	args = parser.parseArgs();
}

//load the package.json file for the project from the root dir
function load_app_package_json(){
	try{
		app_pkg_json = require(app_dir + "/package.json");
	}catch(e){
		fatal_err("No package.json file in project root!");
	}
	Joi.validate(app_pkg_json, package_schema, SCHEMA_VOPTS, function (err, value) { 
		if(err){
			fatal_err("Invalid package.json file!", err.ValidationError);
		}
	});
}

//create the commandline interface
function create_command_line_interface(){
	cmdln_input = Readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
}

//run the argument-specified subcommand on the specified version or confirm usage of local version
function run_subcommand_on_version(){
	var use_default = !args.appversion,
		version = Semver.clean(args.appversion || app_pkg_json.version);

	if(!version) return fatal_err("Supplied version is not valid semver!", version);

	if(['current','preview'].indexOf(args.subcommand_name)!==-1) return sub_command(version);	

	create_command_line_interface();

	var msg = "Confirm '"+args.subcommand_name+"' for "+(use_default?"(default) ":'')+" version "+version+" - (yes/no)";

	cmdln_input.question(msg, function(resp){
			resp = resp.toLowerCase();
			if(resp !== 'y' && resp !== 'yes'){
				//TODO = fix
				//console.log("Exiting...");
				//process.exit();
			}
			cmdln_input.close();
			sub_command(version);
	});
}

function sub_command(version){
	switch(args.subcommand_name){
		case 'release':
			var release = require("../lib/release.js");
			release.run(config, version, args.date);
			break;
		case 'remove':
			var command = require("../lib/remove.js");
			break;
		case 'preview':
			var preview = require("../lib/preview.js");
			preview.run(config, version);
			break;
		case 'current':
			var current = require("../lib/current.js");
			current.run(config);
			break;
	}
}

load_app_package_json();
setup_parser_and_commands();
load_config_data();
run_subcommand_on_version();
