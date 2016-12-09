# s3-release-notes
NPM module to easily create/edit/push/track release notes for a project to an s3 bucket, right within your app's project dir.

This module provides a CLI for quickly and easily managing release notes for a project, which are stored on an s3bucket in a file **versions.json**. Release support a release date, semver version, and notes (in markdown). 

The library also includes a JS module to consume the version info in your application and do things like compare current versions against released versions, exposing release notes of these versions, etc.

The project was inspired by a neww in a Google Chrome Extension, in which I wanted to be able to track new features that could be exposed to a user upon an extension update (compairing the previously installed version to the newly released version)

Installation
-----
This library requires you to be using NPM in your project. To install simply run `npm install s3-release-notes` in your project's root directory. 

NPM creates a run task (which is made available via CLI from NPMs process of creating a symlink to the folder in `node_modules/.bin`, allowing you to do `npm run <task>` for dependency tasks. You can also modify your `$PATH` with _direnv_ to run the CLI command directly by adding `PATH=$PATH:./node_modules/.bin`

Configuration
-----
To use release notes, you must have a config file present in your project's root directory, named `.s3releasenotesrc` with the following format
```javascript
{ 
    "s3Bucket": "my-s3-bucket", 
    "keyPrefix": "sample/prefix/"
}
```
_NOTE_ that `keyPrefix` is optional and only neeed if you wish to save the **versions.json** file somewhere other than the bucket root.

Additionally, you must have proper `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` variables setup in your _$PATH_ for the tool to properly manage the file on s3, or pass them into the CLI via args.

CLI
-----
The cli is used as:
```
s3-releaes-notes <command> [options]
```
Available commands are:

| Command | Opts | Description |
| ------ | ------ | ------ |
| **release** | appversion, date | Add/update a version in releases (and bump current version if needed) |
| **remove** | appversion | Remove a version from releases|
| **list** | | List currently published versions |
| **preview** | appversion | Preview formatted markdown for a released version |
| **current** | | List the current published version |

All options are optional, but those available to commands are listed in the table above:

| Option | Default | Description |
| ------ | ------ | ------ |
| `--appversion`, `-av` | Current version in project's package.json | Version of hte app you wish to perform the command for |
| `--date`, `-d` | Today's date | Date you wish to apply release as (format is YYYY-MM-DD)|
| `--configfile`, `-cf` | `s3ReleaseNotes.json` in project root | Location of s3-release-notes config file |
| `--aws_access_key_id`, `-aws_key` | null | Acess key ID for aws account that has write access to bucket in config |
| `--aws_secret_access_key`, `-aws_secret` | null | AWS Secret key matching Access Key ID |

All commands that make changes to the version.json file include terminal prompts and verifications to ensure that you are making the correct changes you intend. When working on release notes, your default `$EDITOR` is used.

#### Examples
```
# s3-release-notes release
```
```
# s3-release-notes remove --appversion 1.4.5
```
```
# s3-release-notes list --aws_access_key_id "FOO" --aws_secret_access_key "BAR"
```

Consumer
-----
In your applications, you can include the file `src/s3-release-notes.js` and get an instance of the consumer object.
```javascript
s3ReleaseNotes("https://my-bucket.s3.amazonaws.com/", function(loaded, s3ReleaesNotesInstance){
	//do whatever with s3ReleaseNotesInstance (will be null if !loaded)
});
``` 
The consumer instance object exposes the following functions:

#### .getCurrent()
Get the current released version of the application

#### .getVersions()
Get the full list of all released versions (in array with each in format from `.getVersionInfo()` below)

#### .getVersionInfo(version)
Get information for the specified version in the format `{version:"1.2.3", notes: "markup release notes", date: "2016-0101"}`

#### .getNewerVersions(version)
Get all released versions more recent than the supplied version in the format `['4.5.6','4.3.1',...]`