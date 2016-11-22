const 	s3v = require('./s3_tools.js'),
		Utils = require('./utils.js');

exports.run = function(config){
	s3Version = s3v.new(config);

	s3Version.loadVersionInfo(function(){
		var current = s3Version.getCurrent();

		if(!current) Utils.fatalError("No releases are present yet!");
			
		var existing = s3Version.getExisting(current);

		Utils.console.note("Current release version is "+current+" (released "+existing.date+")");
		process.exit();
	});	
};