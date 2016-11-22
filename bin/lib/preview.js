const 	s3v = require('./s3_tools.js'),
		Utils = require('./utils.js');

exports.run = function(config, version){
	s3Version = s3v.new(config);

	s3Version.loadVersionInfo(function(){

		var existing = s3Version.getExisting(version);

		if(!existing.date){
			Utils.fatalError("Verion "+version+" does not exist in releases!");
		}
		
		Utils.console.br();
		Utils.console.note("Release notes for version "+version+" (on "+existing.date+")");
		Utils.console.hr();
		Utils.outputAsMarkdown(existing.notes);
		Utils.console.hr();
	});
};