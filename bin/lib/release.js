const 	s3v = require('./s3_tools.js'),
		Utils = require('./utils.js'),
		Editor = require('editor'),
		Semver = require('semver'),
		fs = require('fs');

var s3Version = null;

exports.run = function(config, version, date){

	Utils.console.br();
	Utils.console.note("After confirmation, an editor will open - enter/edit the (markdown supported) releae notes, then save/exit the file to continue");
	
	//initialize local or S3 file repo
	s3Version = s3v.new(config);

	//load & parse existing version info
	s3Version.loadVersionInfo(function(){

		//fetch existing data for this version & generate temp file w/ markdown
		var existing = s3Version.getExisting(version),
			current = s3Version.getCurrent(),
			date = date || existing.date || (new Date().toJSON().slice(0,10)),
			msg = "Confirm RELEASE for version " + version + " (on " + date + ")";

		if( !Semver.gt(version, current) && version != current){
			var msg2 = "You selected a version previous to current ("+current+")"
			if(!existing.date){
				msg2 += ", and which has not been previously released";
			}
			Utils.console.notice(msg2);	
		}

		//get terminal confirm from user
		Utils.terminalConfirm( msg, function(){
			
			var notes = existing.notes,
				fname = Utils.setupTempFile( notes, version );

			//bind cleanup handler on exit to remove tempfile
			Utils.cleanupHandler(function(){
				Utils.removeTempFile(fname);
			})

			Utils.console.status("Opening editor", "save & exit the TMP file in editor to continue");
			
			function doEdit(){
				//open $EDITOR w/ temp file	
				Editor(fname, function (code, sig) {
					notes = fs.readFileSync(fname, 'utf8');

					Utils.console.br();
					Utils.console.status("Editor closed", "confirm updates");
					Utils.console.hr();
					Utils.outputAsMarkdown(notes);
					Utils.console.hr();

					var msg = "Would you like to push the above markdown as the release notes for version "+version+"?";
					Utils.terminalConfirm( msg, editsConfirmed, doEdit);
				})
			}

			function editsConfirmed(code, sig){
				//update version for this file
			    s3Version.update(version, notes, date, function(err){
					if(err) Utils.fatalError("Updating version "+version+" - unable to write to s3 file!");

					Utils.console.br();
					Utils.success("Version "+version+" updated successfully!")
				});
			}

			doEdit();

		}, Utils.exitGraceful );

	});
};