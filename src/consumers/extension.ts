import * as path from 'path';
import * as vscode from 'vscode';
import { DumpsService } from '../services/dumps';
import { RepositoriesService } from '../services/repositories';
import { StorageService } from '../services/storage';
import { WebviewPanel } from './webview/WebviewPanel';
import { WebviewViewProvider } from './webview/WebviewViewProvider';

/**
 * Activates the extension
 */
export function activate(context: vscode.ExtensionContext) {
  // Initialize storage service
  const storage = new StorageService(
    context.workspaceState,
    context.globalState
  );

  // Initialize repositories service
  const repositoriesService = new RepositoriesService(storage);

  // Initialize dumps service
  const dumpsService = new DumpsService(storage);

  // Check current workspace and add/update repository on activation
  const checkCurrentWorkspace = async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      const workspacePath = workspaceFolder.uri.fsPath;
      const workspaceName = path.basename(workspacePath);
      try {
        await repositoriesService.addOrUpdateRepository(
          workspaceName,
          workspacePath
        );
      } catch (error) {
        console.error('[Repositories] Failed to add/update repository:', error);
      }
    } else {
      console.log('[Repositories] No workspace folder found');
    }
  };

  // Check workspace on activation
  checkCurrentWorkspace().catch(error => {
    console.error('[Repositories] Error in checkCurrentWorkspace:', error);
  });

  // Register command to open webview
  const disposable = vscode.commands.registerCommand(
    'devxcode.openWebview',
    () => {
      WebviewPanel.createOrShow(
        context.extensionUri,
        storage,
        repositoriesService,
        dumpsService,
        context
      );
    }
  );

  // Register webview view provider for sidebar
  const webviewViewProvider = new WebviewViewProvider(
    context.extensionUri,
    storage,
    context,
    repositoriesService,
    dumpsService
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'devxcodeView',
      webviewViewProvider
    )
  );

  context.subscriptions.push(disposable);
}

/**
 * Deactivates the extension
 */
export function deactivate() { }
