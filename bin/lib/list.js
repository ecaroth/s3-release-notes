"use strict";

const 	s3v = require('./s3_version.js'),
		Utils = require('./utils.js');

exports.run = (config, opts) => {
	const s3Version = s3v.create(config, opts.awsAccessKeyId, opts.awsSecretKey);

	s3Version.loadVersionInfo(() => {

		let versions = s3Version.getVersions(),
			current = s3Version.getCurrent();

		if(versions.length==0) utils.fatalError("No releases are currently published");

		
		Utils.console.br();
		Utils.console.note("Published releases:");
		Utils.console.hr();
		versions.forEach((ver) => {
			console.log(ver.version + (ver.version==current ? " (current)":""));
		});
		Utils.console.hr();
	});
};