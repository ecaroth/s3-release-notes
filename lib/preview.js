const 	s3v = require('./s3_tools.js'),
		Marked = require('marked'),
		TerminalRenderer = require('marked-terminal');

Marked.setOptions({
  // Define custom renderer 
  renderer: new TerminalRenderer()
});		

function run(config, version){
	s3Version = s3v.new(config, version);

	s3Version.loadVersionInfo(function(){
		var existing = s3Version.getExisting(version);

		if(!existing.date){
			console.log("ERROR - verion "+version+" does not exist in releases!");
			process.exit();
		}
		
		console.log("------------------------------------");
		console.log(Marked(existing.notes));
		console.log("------------------------------------");
	});
	
}



exports.run = run;