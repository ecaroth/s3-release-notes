const 	s3v = require('./s3_tools.js'),
		Editor = require('editor'),
		fs = require('fs');

var s3Version = null;

function run(config, version, date){
	s3Version = s3v.new(config);

	s3Version.loadVersionInfo(function(){

		var existing = s3Version.getExisting(version),
			fname = setup_temp_file( existing.notes, version );

		Editor(fname, function (code, sig) {
		    var notes = fs.readFileSync(fname, 'utf8');

		    //TODO - confirm markdown output before pushing!!!
			s3Version.update(version, notes, date, function(err){
				if(err){
					console.log("ERROR updating version "+version+" - unable to write to s3 file");
					process.exit();
				}
				//TODO - cleanup!
				console.log("DONE");
			});
		});
	});
}

function setup_temp_file(notes, version){
	var fname = "./tmp/v" + version + " ("+(new Date().getTime())+").tmp";
	if (!fs.existsSync("./tmp")){
	    fs.mkdirSync("./tmp");
	}
	fs.writeFileSync(fname, notes || "");
	return fname;
}



exports.run = run;