import * as vscode from 'vscode';

export function handleGitHelperMessage(message: Record<string, unknown>) {
  if (message.command === 'executeGitHelper') {
    console.log('executeGitHelper', message);
    if (!message.gitCommand || typeof message.gitCommand !== 'string') {
      vscode.window.showErrorMessage('Invalid git command');
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        'No workspace folder open. Please open a workspace first.'
      );
      return;
    }

    // Get or create terminal
    let terminal = vscode.window.terminals.find(t => t.name === 'Git Helpers');

    if (!terminal) {
      terminal = vscode.window.createTerminal({
        name: 'Git Helpers',
        cwd: workspaceFolder.uri.fsPath,
      });
    }

    // Show terminal and execute command
    terminal.show();
    terminal.sendText(message.gitCommand);
  }
}
