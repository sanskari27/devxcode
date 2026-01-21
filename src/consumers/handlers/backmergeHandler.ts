import * as vscode from 'vscode';
import {
  checkBranchStatus,
  cherryPickCommit,
  createBackmergeBranch,
  deleteBranch,
  getBranchCommits,
  getLocalBranches,
  pullBranch,
} from '../utils/gitUtils';
import { getNonce } from '../utils/webviewUtils';

// Track open backmerge panels
const openBackmergePanels = new Map<string, vscode.WebviewPanel>();

export async function handleOpenBackmergeWebviewMessage(
  message: Record<string, unknown>,
  context: vscode.ExtensionContext,
  extensionUri: vscode.Uri,
  postMessage: (message: unknown) => void
) {
  switch (message.command) {
    case 'openBackmergeWebview':
      try {
        const panelId = 'backmerge';

        // Check if panel is already open
        const existingPanel = openBackmergePanels.get(panelId);
        if (existingPanel) {
          existingPanel.reveal();
          return;
        }

        // Create new backmerge panel
        const panel = vscode.window.createWebviewPanel(
          'backmerge',
          'Backmerge',
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.joinPath(extensionUri, 'out'),
              vscode.Uri.joinPath(extensionUri, 'out/webview'),
            ],
          }
        );

        // Track this panel
        openBackmergePanels.set(panelId, panel);

        // Remove from map when panel is disposed
        panel.onDidDispose(() => {
          openBackmergePanels.delete(panelId);
        });

        // Get webview resources
        const scriptUri = panel.webview.asWebviewUri(
          vscode.Uri.joinPath(
            extensionUri,
            'out',
            'webview',
            'assets',
            'index.js'
          )
        );
        const styleUri = panel.webview.asWebviewUri(
          vscode.Uri.joinPath(
            extensionUri,
            'out',
            'webview',
            'assets',
            'index.css'
          )
        );

        const nonce = getNonce();

        // Set webview HTML
        panel.webview.html = `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net;">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>Backmerge</title>
          </head>
          <body>
            <div id="root"></div>
            <script nonce="${nonce}">
              const vscode = acquireVsCodeApi();
              window.backmergeView = true;
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
          </body>
          </html>`;

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
          async (msg: Record<string, unknown>) => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
              panel.webview.postMessage({
                command: 'error',
                message: 'No workspace folder open',
              });
              return;
            }

            const workspacePath = workspaceFolder.uri.fsPath;

            switch (msg.command) {
              case 'getLocalBranches': {
                try {
                  const branches = await getLocalBranches(workspacePath);
                  panel.webview.postMessage({
                    command: 'localBranches',
                    branches,
                  });
                } catch (error: any) {
                  panel.webview.postMessage({
                    command: 'error',
                    message: error.message || 'Failed to get local branches',
                  });
                }
                break;
              }

              case 'checkBranchStatus': {
                if (!msg.branchName || typeof msg.branchName !== 'string') {
                  panel.webview.postMessage({
                    command: 'error',
                    message: 'Branch name is required',
                  });
                  return;
                }
                try {
                  const status = await checkBranchStatus(
                    workspacePath,
                    msg.branchName as string
                  );
                  panel.webview.postMessage({
                    command: 'branchStatus',
                    branchName: msg.branchName,
                    isBehind: status.isBehind,
                    commitCount: status.commitCount,
                  });
                } catch (error: any) {
                  panel.webview.postMessage({
                    command: 'error',
                    message: error.message || 'Failed to check branch status',
                  });
                }
                break;
              }

              case 'pullBranch': {
                if (!msg.branchName || typeof msg.branchName !== 'string') {
                  panel.webview.postMessage({
                    command: 'error',
                    message: 'Branch name is required',
                  });
                  return;
                }
                try {
                  await pullBranch(workspacePath, msg.branchName as string);
                  panel.webview.postMessage({
                    command: 'pullSuccess',
                    branchName: msg.branchName,
                  });
                } catch (error: any) {
                  panel.webview.postMessage({
                    command: 'error',
                    message: error.message || 'Failed to pull branch',
                  });
                }
                break;
              }

              case 'getBranchCommits': {
                if (!msg.branchName || typeof msg.branchName !== 'string') {
                  panel.webview.postMessage({
                    command: 'error',
                    message: 'Branch name is required',
                  });
                  return;
                }
                try {
                  const limit = typeof msg.limit === 'number' ? msg.limit : 10;
                  const skip = typeof msg.skip === 'number' ? msg.skip : 0;
                  const commits = await getBranchCommits(
                    workspacePath,
                    msg.branchName as string,
                    limit,
                    skip
                  );
                  panel.webview.postMessage({
                    command: 'branchCommits',
                    branchName: msg.branchName,
                    commits,
                  });
                } catch (error: any) {
                  panel.webview.postMessage({
                    command: 'error',
                    message: error.message || 'Failed to get branch commits',
                  });
                }
                break;
              }

              case 'createBackmergeBranch': {
                if (!msg.destinationBranch || typeof msg.destinationBranch !== 'string') {
                  panel.webview.postMessage({
                    command: 'error',
                    message: 'Destination branch is required',
                  });
                  return;
                }
                
                const selectedCommits = Array.isArray(msg.selectedCommits) 
                  ? msg.selectedCommits.filter((id): id is string => typeof id === 'string')
                  : [];
                
                let newBranchName: string | null = null;
                
                try {
                  // Create the branch
                  newBranchName = await createBackmergeBranch(
                    workspacePath,
                    msg.destinationBranch as string
                  );
                  
                  // If there are selected commits, cherry-pick them in order
                  if (selectedCommits.length > 0) {
                    for (const commitId of selectedCommits) {
                      try {
                        await cherryPickCommit(workspacePath, newBranchName, commitId);
                      } catch (cherryPickError: any) {
                        // If cherry-pick fails, delete the branch and stop
                        // Checkout destination branch first if we're on the new branch
                        try {
                          await deleteBranch(workspacePath, newBranchName, msg.destinationBranch as string);
                        } catch (deleteError) {
                          // Log but don't fail on delete error
                          console.error('Failed to delete branch after cherry-pick error:', deleteError);
                        }
                        panel.webview.postMessage({
                          command: 'backmergeBranchError',
                          message: `Failed to cherry-pick commit ${commitId}: ${cherryPickError.message}. Branch ${newBranchName} has been deleted.`,
                        });
                        return;
                      }
                    }
                  }
                  
                  // Success - all commits cherry-picked (or no commits to cherry-pick)
                  panel.webview.postMessage({
                    command: 'backmergeBranchCreated',
                    branchName: newBranchName,
                  });
                } catch (error: any) {
                  // If branch creation failed, try to clean up if branch was created
                  if (newBranchName) {
                    try {
                      await deleteBranch(workspacePath, newBranchName, msg.destinationBranch as string);
                    } catch (deleteError) {
                      console.error('Failed to delete branch after creation error:', deleteError);
                    }
                  }
                  panel.webview.postMessage({
                    command: 'error',
                    message: error.message || 'Failed to create backmerge branch',
                  });
                }
                break;
              }
            }
          },
          null,
          context.subscriptions
        );
      } catch (error) {
        console.error('Failed to open backmerge webview:', error);
        vscode.window.showErrorMessage(`Failed to open backmerge webview: ${error}`);
      }

      return;
  }
}
