// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let animatedstatusBarItem : vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	animatedstatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
	animatedstatusBarItem.text = "$(loading~spin)";
	animatedstatusBarItem.hide();
	context.subscriptions.push(animatedstatusBarItem);

	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
		 // Verify that the document is a .scss or .ts file
		 if (document.languageId === 'scss' || document.languageId === 'typescript') {
			const currentFilePath = document.uri.fsPath;

			const requiredCommonFile = vscode.workspace.getConfiguration('run-cmd-on-save').requiredCommonFile;
			
			// Find the directory to run the command in
			findDirectoryWithFile(currentFilePath, requiredCommonFile).then(directoryToRunCommandIn => {
				if (directoryToRunCommandIn) {
					// Run the command in the found directory
					runCommand(directoryToRunCommandIn);
				} else {
					vscode.window.showErrorMessage(`Unable to find ${requiredCommonFile} in the ${document.fileName}'s directory tree.`);
				}
			}).catch(error => {
			  	vscode.window.showErrorMessage(`An error occurred: ${error.message}`);
			});
		  }
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}

function findDirectoryWithFile(filePath: string, fileName: string): Promise<string | undefined> {
	const dirname = path.extname(filePath).length === 0 ? filePath : path.dirname(filePath);
  
	return new Promise((resolve, reject) => {
	  // Recursively look for the file in the parent directories
	  fs.readdir(dirname, (err, files) => {
		if (err) {return reject(err);}
  
		if (files.includes(fileName)) {
		  // Found the file, resolve with the current directory
		  resolve(dirname);
		} else {
		  const parentDir = path.resolve(dirname, '..');
		  // Check if we have reached the workspace root
		  if (parentDir === dirname) {
			resolve(undefined); // File not found in any parent directory
		  } else {
			// Continue search in the parent directory
			resolve(findDirectoryWithFile(parentDir, fileName));
		  }
		}
	  });
	});
  }
  
function runCommand(directory: string) {
		const command = vscode.workspace.getConfiguration('run-cmd-on-save').command;
	
		animatedstatusBarItem?.show();
		child_process.exec(command, { cwd: directory, maxBuffer: Number.MAX_VALUE }, (error, stdout, stderr) => {
			animatedstatusBarItem?.hide();
			if (error) {
				return vscode.window.showErrorMessage(`Error executing command ${command}: ${error.message}`);
			}
			if (stderr) {
				return vscode.window.showErrorMessage(`Command ${command} error output: ${stderr}`);
			}
			vscode.window.showInformationMessage("Saving Succeeded.")
		});
}