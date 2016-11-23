# s3-release-notes
NPM module to easily create/edit/push/track release notes for a project to an s3 bucket

This module provides CLI to quickly and easily managing release notes for a project, that are stored on an s3bucket in a JSON file. Release support a release date, semver version, and notes (in markdown). 

The module also includes a JS module to consume the version info in your application and do things like compare current versions against released versions, exposing release notes of these versions.

The project was inspired by a Google Chrome Extension, in which I wanted to be able to track new features that could be exposed to a user upon an extension update (compairing the previously installed version to the newly released version)

Installation
-----
To install simply pull the repo down via `npm install s3-release-notes`. 
#TODO - more

Configuration
-----
To use release notes, you must have a config file present in your project's root directory, named `s3ReleaseNotes.json` with the following format
```
{ 
    "s3Bucket": "my-s3-bucket", 
    "keyPrefix": "sample/prefix/"
    }
```
_NOTE_ that `keyPrefix` is optional and only neeed if you wish to save the versions.json file somewhere other than the bucket root.

Additionally, you must have proper `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` variables setup in your $PATH for the tool to properly manage the file on s3.

CLI
-----
The cli is used as:
```
s3-releaes-notes <command> [options]
```
Available commands are:

| Command | Opts | Description |
| -------------- | -------------- | -------------- |
| **release** | appversion, date | Add/update a version in releases (and bump current version if needed) |
| **remove** | appversion | Remove a version from releases|
| **list** | | List currently published versions |
| **preview** | appversion | Preview formatted markdown for a released version |
| **current** | | List the current published version |



All options are optional, but those available to commands are listed in the table above:

| Option | Default | Description |
 -------------- | -------------- | -------------- |
| `--appversion`, `-av` | Current version in project's package.json | Version of hte app you wish to perform the command for |
| `--date`, `-d` | Today's date | Date you wish to apply release as (format is YYYY-MM-DD)|
| `--configfile`, `-cf` | `s3ReleaseNotes.json` in project root | Location of s3-release-notes config file

All commands that make changes to the version.json file include terminal prompts and verifications to ensure that you are making the correct changes you intend. When working on release notes, your default `$EDITOR` is used.

#### Examples
```
# s3-release-notes release
```
```
# s3-release-notes remove --appversion 1.4.5
```


Consumer
-----