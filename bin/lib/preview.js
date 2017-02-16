"use strict";

const   s3v = require('./s3_version.js'),
        Utils = require('./utils.js');

exports.run = (config, opts) => {
    const s3Version = s3v.create(config, opts.awsAccessKeyId, opts.awsSecretKey);

    s3Version.loadVersionInfo(() => {

        let existing = s3Version.getExisting(opts.version);

        if(!existing.date){
            Utils.fatalError(`Verion ${opts.version} does not exist in releases!`);
        }
        
        Utils.console.br();
        Utils.console.note(`Release notes for version ${opts.version} (on ${existing.date})`);
        Utils.console.hr();
        Utils.outputAsMarkdown(existing.notes);
        Utils.console.hr();
    });
};