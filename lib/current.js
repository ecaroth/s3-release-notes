const 	s3v = require('./s3_tools.js');

function run(config){
	s3Version = s3v.new(config);

	s3Version.loadVersionInfo(function(){
		var current = s3Version.getCurrent();

		if(!current){
			console.log("ERROR - no releases are present yet!");
			process.exit();
		}
		
		var existing = s3Version.getExisting(current);

		console.log("Current Version is "+current+" (released "+existing.date+")");
		process.exit();
	});
	
}



exports.run = run;