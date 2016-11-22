const 	s3v = require('./s3_tools.js'),
		Utils = require('./utils.js');

exports.run = function(config){
	s3Version = s3v.new(config);

	s3Version.loadVersionInfo(function(){

		var versions = s3Version.getVersions(),
			current = s3Version.getCurrent();

		if(versions.length==0) utils.fatalError("No releases are currently published");

		
		Utils.console.br();
		Utils.console.note("Published releases:");
		Utils.console.hr();
		versions.forEach(function(ver){
			console.log(ver.version + (ver.version==current ? " (current)":""));
		});
		Utils.console.hr();
	});
};