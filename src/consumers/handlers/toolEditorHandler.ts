import * as vscode from 'vscode';
import { UtilitiesService } from '../../services/utilities';
import { getNonce } from '../utils/webviewUtils';

// Track open tool editors by toolId
const openToolEditors = new Map<string, vscode.WebviewPanel>();

export async function handleOpenToolEditorMessage(
  message: Record<string, unknown>,
  context: vscode.ExtensionContext,
  extensionUri: vscode.Uri
) {
  switch (message.command) {
    case 'openToolEditor':
      if (!message.toolId || typeof message.toolId !== 'string') {
        return;
      }

      try {
        const toolId = message.toolId as string;

        // Check if editor for this tool is already open
        const existingPanel = openToolEditors.get(toolId);
        if (existingPanel) {
          // Reveal existing panel
          existingPanel.reveal();
          return;
        }

        const utilitiesService = new UtilitiesService();
        const tool = utilitiesService.getToolById(toolId);

        if (!tool) {
          vscode.window.showErrorMessage(`Tool with id ${toolId} not found`);
          return;
        }

        // Create new tool editor panel
        const panel = vscode.window.createWebviewPanel(
          'toolEditor',
          tool.name,
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
        openToolEditors.set(toolId, panel);

        // Remove from map when panel is disposed
        panel.onDidDispose(() => {
          openToolEditors.delete(toolId);
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
            <title>${tool.name}</title>
          </head>
          <body>
            <div id="root"></div>
            <script nonce="${nonce}">
              const vscode = acquireVsCodeApi();
              window.toolId = ${JSON.stringify(toolId)};
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
          </body>
          </html>`;

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
          (message: Record<string, unknown>) => {
            // Handle any messages from tool editor if needed
            console.log('Tool editor message:', message);
          },
          null,
          context.subscriptions
        );
      } catch (error) {
        console.error('Failed to open tool editor:', error);
        vscode.window.showErrorMessage(`Failed to open tool editor: ${error}`);
      }

      return;
  }
}
