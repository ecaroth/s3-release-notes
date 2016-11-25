"use strict";

const 	Readline = require('readline'),
		Marked = require('marked'),
		TerminalRenderer = require('marked-terminal'),
		Colors = require('colors'),
		fs = require('fs');

var cmdLine = null;

Marked.setOptions({
  // Define custom renderer 
  renderer: new TerminalRenderer()
});

function createCommandLineInterface(){
	cmdLine = Readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
}

function closeCommandLineInterface(){
	cmdLine.close();
}

//fatal error occured, halt CLI execution
exports.fatalError = (msg) => {
	exports.console.br();
	exports.console.error(msg);
	process.exit();
};

//successful outcome - print as such and exit process
exports.success = (msg) => {
	exports.console.success(msg);
	process.exit();
};

//create a temporary file for this version and populate it w/ existing notes
exports.setupTempFile = (notes, version) => {
	var fname = `./tmp/v${version} (${(new Date().getTime())}).tmp`;
	if (!fs.existsSync("./tmp")){
	    fs.mkdirSync("./tmp");
	}
	fs.writeFileSync(fname, notes || "");
	return fname;
};

//exit gracefully
exports.exitGraceful = function(){
	console.log("Exiting...".italic);
	process.exit();
};

//get confirmation from user of action
exports.terminalConfirm = function(msg, yes_cb, no_cb){
	
	msg = `>> ${msg} - (${"yes".underline.bold}/"${"no".underline.bold}):  `;

	function _inputResponse(resp){
		resp = resp.toLowerCase();
		closeCommandLineInterface();

		if(resp === 'y'|| resp === 'yes'){
			return yes_cb();
		}else if(resp === 'n' || resp === 'no'){
			return no_cb();
		}
		msg = "Invalid response, try again: ";
		_getInput(msg);
	}

	function _getInput(msg){
		createCommandLineInterface();
		cmdLine.question(msg, _inputResponse);
	}

	_getInput(msg);
};

//close temp file
exports.removeTempFile = (fpath) => {
	try{
		fs.unlinkSync(fpath);
	}catch(e){}
};

//print text to console as formatted markdown
exports.outputAsMarkdown = (text) => {
	console.log(Marked(text));
};

//run a cleanup function on exit
exports.cleanupHandler = (exitHandler) =>{
	//do something when app is closing
	process.on('exit', exitHandler.bind(null, {cleanup:true}));
	//catches ctrl+c event
	process.on('SIGINT', exitHandler.bind(null, {exit:true}));
	//catches uncaught exceptions
	process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
};

exports.console = {
	note: (str) => {
		str = `::${str}::`;
		console.log(str.bold.green);
	},
	notice: (str) => {
		console.log(`${"NOTE".yellow} - ${str}`);
	},
	error: (str) => {
		console.log(`${"ERROR".red} - ${str}`);
	},
	success: (str) => {
		console.log(`${"SUCCESS".green} - ${str}`);
	},
	status: function(str, extra){
		var s = `${str}...`; 
		if(extra) s += " " + (`(${extra})`).dim.italic;
		console.log(s);
	},
	hr: () => {
		console.log("---------------------------------".dim);
	},
	br: () => {
		console.log("");
	}
};