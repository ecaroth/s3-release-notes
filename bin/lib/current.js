"use strict";

const   s3v = require('./s3_version.js'),
        Utils = require('./utils.js');

exports.run = (config, opts) => {
    const s3Version = s3v.create(config, opts.awsAccessKeyId, opts.awsSecretKey);

    s3Version.loadVersionInfo(() => {
        let current = s3Version.getCurrent(),
            existing = s3Version.getExisting(current);

        if(!current) Utils.fatalError("No releases are present yet!");

        Utils.console.note(`Current release version is ${current} (released ${existing.date})`);
        process.exit();
    }); 
};