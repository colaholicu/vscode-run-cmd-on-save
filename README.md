# run-cmd-on-save

Simple extension for VS Code that runs a command when saving a TypeScript/SCSS file

## Features

* Runs a command (`run-cmd-on-save.command`) inside the folder containing `run-cmd-on-save.requiredCommonFile`

## Extension Settings

This extension contributes the following settings:

* `run-cmd-on-save.command`: the command to be run
* `run-cmd-on-save.requiredCommonFile`: the required common file in the saved files directory tree
* `run-cmd-on-save.commandTimeout`: the time in seconds after which the process is killed (default: 5)

## Release Notes

### 0.1.1

Updated Changelog

### 0.1.0

Added better verbose logging
Added command timeout support

### 0.0.1

Added support for running a command inside the found folder

-----------------------------------------------------------------------------------------------------------

**Enjoy!**