// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let animatedstatusBarItem : vscode.StatusBarItem;
let outputChannel : vscode.OutputChannel;

const extensionName = 'run-cmd-on-save';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	animatedstatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
	animatedstatusBarItem.text = "Saving file... $(loading~spin)";
	animatedstatusBarItem.hide();
	context.subscriptions.push(animatedstatusBarItem);

	outputChannel = vscode.window.createOutputChannel("Run Command on Save");

	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
		 // Verify that the document is a .scss or .ts file
		 if (document.languageId === 'scss' || document.languageId === 'typescript') {
			const currentFilePath = document.uri.fsPath;

			const requiredCommonFile = vscode.workspace.getConfiguration(extensionName).requiredCommonFile;
			
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
	const command = vscode.workspace.getConfiguration(extensionName).command;

	animatedstatusBarItem?.show();
	outputChannel.show(true);
	
	const child = child_process.spawn(command, [], { cwd : directory, shell: true });

	const timeout = setTimeout(() => {
		child.kill();
	}, vscode.workspace.getConfiguration(extensionName).commandTimeout * 1000);

	let errorMsg : string = "";

	// Handle process exit
	child.on('exit', (code) => {
		clearTimeout(timeout);

		// Always hide status bar
		animatedstatusBarItem?.hide();
	});

	child.stdout.on('data', (data) => {
		outputChannel.append(data.toString());
	});

    child.stderr.on('data', (data) => {
		outputChannel.append(data.toString());
		vscode.window.showErrorMessage(`${data}`);
    });

    child.stderr.on('end', () => {        
		child.kill();
    });
}