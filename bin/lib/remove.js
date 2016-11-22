const 	s3v = require('./s3_tools.js'),
		Utils = require('./utils.js');

exports.run = function(config, version){
	s3Version = s3v.new(config);

	s3Version.loadVersionInfo(function(){
		var existing = s3Version.getExisting(version);

		if(!existing.date){
			Utils.fatalError("Verion "+version+" does not exist in releases!");
		}

		var current = s3Version.getCurrent();

		Utils.console.br();
		Utils.console.note("Removing released version "+ version + (current==version ? " (current)":"") );

		var msg = "Are you sure you wish to remove version " + version;
		//get terminal confirm from user
		Utils.terminalConfirm( msg, function(){

			s3Version.remove(version, function(err){
				if(err) Utils.fatalError("Removing version "+version+" - unable to write to s3 file!");

				current = s3Version.getCurrent();
				Utils.console.br();
				Utils.success("Version "+version+" removed successfully!");
				if(current){
					Utils.notice("Current version is "+current);
				}else{
					Utils.notice("There is no current releae version!");
				}
			});

		}, Utils.exitGraceful );
	});
};