"use strict";

(function(exports){

	function _s3ReleaseNotes(versionData){

		var versions = !('versions' in versionData) ? [] : versionData.versions,
			current = !('current' in versionData) ? null : versionData.current;

		versions.sort(_semverCompare);

		//get the curent release version
		function _getCurrent(){
			return current || null;
		}

		//get full list of released versions
		function _getVersions(){
			return versions;
		}

		//get information for a specific released version
		function _getVersionInfo(version){
			for(var i=0; i<versions.length; i++){
				if(versions[i].version === version){
					return versions[i];
				}
			}
			return null;
		}

		//get list of newer versions than provided version
		function _getNewerVersions(version){
			var newer = [];
			for(var i=0; i<versions.length; i++){
				if(_semverCompare(versions[i].versions, version) === 1){
					newer.push(versions[i].version);
				}
			}
			return newer;
		}

		//compare two semvars (returns 1 if a > b, -1 if b > a, 0 if a == b)
		function _semverCompare(a, b){
			var pa = a.split('.'),
				pb = b.split('.');
		    for (var i = 0; i < 3; i++) {
		        var na = Number(pa[i]),
		        	nb = Number(pb[i]);
		        if (na > nb) return 1;
		        if (nb > na) return -1;
		        if (!isNaN(na) && isNaN(nb)) return 1;
		        if (isNaN(na) && !isNaN(nb)) return -1;
		    }
		    return 0;
		}

		return {
			getCurrent: _getCurrent,
			getVersions: _getVersions,
			getVersionInfo: _getVersionInfo,
			getNewerVersions: _getNewerVersions
		};
	}

	function create(s3BucketURL, cb){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', s3BucketURL + "/versions.json");
		xhr.onload = function() {
		    if (xhr.status === 200) {
		    	var data = JSON.parse(xhr.responseText);
		    	cb(true, _s3ReleaseNotes(data));
		    }
		    else {
		        cb(false, null);
		    }
		};
		xhr.send();
	}


	exports.s3ReleaseNotes = create;
})(this);