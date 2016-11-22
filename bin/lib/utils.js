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

const createCommandLineInterface = function(){
	cmdLine = Readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
};

const closeCommandLineInterface = function(){
	cmdLine.close();
};

//fatal error occured, halt CLI execution
exports.fatalError = function(msg){
	exports.console.br();
	exports.console.error(msg);
	process.exit();
};

//successful outcome - print as such and exit process
exports.success = function(msg){
	exports.console.success(msg);
	process.exit();
};

//create a temporary file for this version and populate it w/ existing notes
exports.setupTempFile = function(notes, version){
	var fname = "./tmp/v" + version + " ("+(new Date().getTime())+").tmp";
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
}

//get confirmation from user of action
exports.terminalConfirm = function(msg, yes_cb, no_cb){
	
	msg = ">> " + msg +" - ("+"yes".underline.bold+"/"+"no".underline.bold+"):  ";

	function inputResponse(resp){
		resp = resp.toLowerCase();
		closeCommandLineInterface();

		if(resp === 'y'|| resp === 'yes'){
			return yes_cb();
		}else if(resp === 'n' || resp === 'no'){
			return no_cb();
		}
		msg = "Invalid response, try again: ";
		getInput(msg);
	}

	function getInput(msg){
		createCommandLineInterface();
		cmdLine.question(msg, inputResponse);
	}

	getInput(msg);
};

//close temp file
exports.removeTempFile = function(fpath){
	try{
		fs.unlinkSync(fpath);
	}catch(e){}
};

//print text to console as formatted markdown
exports.outputAsMarkdown = function(text){
	console.log(Marked(text));
};

//run a cleanup function on exit
exports.cleanupHandler = function(exitHandler){
	//do something when app is closing
	process.on('exit', exitHandler.bind(null,{cleanup:true}));
	//catches ctrl+c event
	process.on('SIGINT', exitHandler.bind(null, {exit:true}));
	//catches uncaught exceptions
	process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
}

exports.console = {
	note: function(str){
		var str = "::"+str+"::";
		console.log(str.bold.green)
	},
	notice: function(str){
		console.log("NOTE".yellow + " - " + str);
	},
	error: function(str){
		console.log("ERROR".red + " - " + str);
	},
	success: function(str){
		console.log("SUCCESS".green + " - " + str);
	},
	status: function(str, extra){
		var s = str+"...";
		if(extra) s += " " + ("(" + extra + ")").dim.italic;
		console.log(s);
	},
	hr: function(){
		console.log("---------------------------------".dim);
	},
	br: function(){
		console.log("");
	}
};