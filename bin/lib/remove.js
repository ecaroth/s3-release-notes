"use strict";

const   s3v = require('./s3_version.js'),
        Utils = require('./utils.js');

exports.run = (config, opts) => {
    const s3Version = s3v.create(config, opts.awsAccessKeyId, opts.awsSecretKey);

    s3Version.loadVersionInfo(() => {
        let existing = s3Version.getExisting(opts.version),
            current = s3Version.getCurrent();

        if(!existing.date){
            Utils.fatalError(`Verion ${opts.version} does not exist in releases!`);
        }

        Utils.console.br();
        Utils.console.note(`Removing released version ${opts.version} ${current==opts.version ? " (current)" : ""}`);

        let msg = `Are you sure you wish to remove version ${opts.version}?`;

        //get terminal confirm from user
        Utils.terminalConfirm( msg, () => {

            s3Version.remove(opts.version, (err) => {
                if(err) Utils.fatalError(`Removing version ${opts.version} - unable to write to s3 file!`);

                current = s3Version.getCurrent();
                Utils.console.br();
                Utils.success(`Version ${opts.version} removed successfully!`);
                if(current){
                    Utils.notice(`Current version is ${current}`);
                }else{
                    Utils.notice("There is no current releae version!");
                }
            });

        }, Utils.exitGraceful );
    });
};