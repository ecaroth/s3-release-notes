var S3FS = require('s3fs'),
	Semver = require('semver');

const 	VERSIONS_FILE = "versions.json",
		VERSION_BASE = { 'versions': [], 'current': null };

exports.new = function(config){

	var versions = [],
		current = null;

	var fs = require('fs');
	//var fs = new S3FS(config.s3_bucket, options);

	function _key_for_version_file(){
		return (config.key_prefix || "") + VERSIONS_FILE;
	}

	function _update_version_info(version, notes, date, cb){
		var existing = _get_existing(version);

		var obj = {
			notes: notes,
			version: version,
			date: date || existing.date || (new Date().toJSON().slice(0,10)),
		}
		if(existing.index !== -1){
			versions[existing.index] = obj;
		}else{
			versions.push(obj);
		}

		_write_version_info(cb);
	}

	function _load_version_info(cb){
		fs.readFile( VERSIONS_FILE, 'utf8', (err, data) => {
			if(err){
				data = VERSION_BASE;
			}else{
				data = JSON.parse(data);
			}
			versions = data.versions;
			current = data.current;
			cb();
		});
	}

	function _get_existing(version){
		for(var i=0; i<versions.length; i++){
			if(versions[i].version == version){
				return  {date: versions[i].date, notes: versions[i].notes, index:i};
			}
		}
		return {date:null, notes:null, index:-1}
	}

	function _write_version_info(cb){
		//sort by semver versions
		versions.sort(function(a,b){
			return !Semver.gt(a.version, b.version);
		});

		var data = {
			versions: versions,
			current: versions.length > 0 ? versions[0].version : null
		};

		current = data.current;

		fs.writeFile(_key_for_version_file(), JSON.stringify(data), function (err) {
			cb(err);
		});
	}

	function _remove(version, cb){
		var existing = _get_existing(version);
		if(existing.index !== -1){
			versions.splice(existing.index, 1);
		}
		_write_version_info(cb);
	}

	function _get_current(){
		return current;
	}

	function _get_versions(){
		return versions;
	}

	return {
		loadVersionInfo: _load_version_info,
		update: _update_version_info,
		getExisting: _get_existing,
		remove: _remove,
		getCurrent: _get_current,
		getVersions: _get_versions
	};
};