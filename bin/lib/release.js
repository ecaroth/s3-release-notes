"use strict";

const 	s3v = require('./s3_version.js'),
		Utils = require('./utils.js'),
		Editor = require('editor'),
		Semver = require('semver'),
		fs = require('fs');

var s3Version = null;

exports.run = (config, opts) => {
	console.log("CONFIG", config);
	console.log("OPTS", opts);

	Utils.console.br();
	Utils.console.note("After confirmation, an editor will open - enter/edit the (markdown supported) releae notes, then save/exit the file to continue");
	
	//initialize local or S3 file repo
	const s3Version = s3v.create(config, opts.awsAccessKeyId, opts.awsSecretKey);

	//load & parse existing version info
	s3Version.loadVersionInfo(() => {

		//fetch existing data for this version & generate temp file w/ markdown
		let existing = s3Version.getExisting(opts.version),
			current = s3Version.getCurrent(),
			date = opts.date || existing.date || (new Date().toJSON().slice(0,10)),
			msg = `Confirm RELEASE for version ${opts.version} (on ${date})`;

		if( current && !Semver.gt(opts.version, current) && opts.version != current){
			let msg2 = `You selected a version previous to current (${current})`;
			if(!existing.date){
				msg2 += ", and which has not been previously released";
			}
			Utils.console.notice(msg2);	
		}

		//get terminal confirm from user
		Utils.terminalConfirm( msg, () => {
			
			let notes = existing.notes,
				fname = Utils.setupTempFile( notes, opts.version );

			//bind cleanup handler on exit to remove tempfile
			Utils.cleanupHandler(() => {
				Utils.removeTempFile(fname);
			});

			Utils.console.status("Opening editor", "save & exit the TMP file in editor to continue");
			
			function _doEdit(){
				//open $EDITOR w/ temp file	
				Editor(fname, (code, sig) => {
					notes = fs.readFileSync(fname, 'utf8');

					Utils.console.br();
					Utils.console.status("Editor closed", "confirm updates");
					Utils.console.hr();
					Utils.outputAsMarkdown(notes);
					Utils.console.hr();

					let msg = `Would you like to push the above markdown as the release notes for version ${opts.version}?`;
					Utils.terminalConfirm( msg, _editsConfirmed, _doEdit);
				});
			}

			function _editsConfirmed(code, sig){
				//update version for this file
			    s3Version.update(opts.version, notes, date, () => {
					Utils.console.br();
					Utils.success(`Version ${opts.version} updated successfully!`);
				});
			}

			_doEdit();

		}, Utils.exitGraceful );

	});
};