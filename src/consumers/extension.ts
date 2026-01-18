import * as vscode from 'vscode';
import { StorageService } from '../services/storage';
import { getVSCodeTheme } from '../services/theme';

/**
 * Activates the extension
 */
export function activate(context: vscode.ExtensionContext) {
  // Initialize storage service
  const storage = new StorageService(
    context.workspaceState,
    context.globalState
  );

  // Register command to open webview
  const disposable = vscode.commands.registerCommand(
    'devxcode.openWebview',
    () => {
      WebviewPanel.createOrShow(context.extensionUri, storage);
    }
  );

  // Register webview view provider for sidebar
  const webviewViewProvider = new WebviewViewProvider(
    context.extensionUri,
    storage,
    context
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
export function deactivate() {}

/**
 * Manages webview panels
 */
class WebviewPanel {
  public static currentPanel: WebviewPanel | undefined;
  public static readonly viewType = 'devxcodeWebview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _storage: StorageService;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    storage: StorageService
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (WebviewPanel.currentPanel) {
      WebviewPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      WebviewPanel.viewType,
      'DevXCode',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'out'),
          vscode.Uri.joinPath(extensionUri, 'out/webview'),
        ],
      }
    );

    WebviewPanel.currentPanel = new WebviewPanel(panel, extensionUri, storage);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    storage: StorageService
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._storage = storage;

    // Set the webview's initial html content
    this._update();

    // Listen for theme changes
    const themeChangeDisposable = vscode.window.onDidChangeActiveColorTheme(() => {
      this._panel.webview.postMessage({
        command: 'themeChanged',
        theme: getVSCodeTheme(),
      });
    });
    this._disposables.push(themeChangeDisposable);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message: { command: string; key?: string; value?: unknown; message?: string; type?: string }) => {
        switch (message.command) {
          case 'getStorage':
            if (message.key) {
              this._storage.getValue(message.key).then((value) => {
                this._panel.webview.postMessage({
                  command: 'storageValue',
                  key: message.key,
                  value: value,
                });
              });
            }
            return;
          case 'setStorage':
            if (message.key !== undefined) {
              this._storage
                .setValue(message.key, message.value)
                .then(() => {
                  this._panel.webview.postMessage({
                    command: 'storageUpdated',
                    key: message.key,
                  });
                });
            }
            return;
          case 'getTheme':
            this._panel.webview.postMessage({
              command: 'themeChanged',
              theme: getVSCodeTheme(),
            });
            return;
          case 'showNotification':
            if (message.message) {
              const notificationType = message.type === 'error' 
                ? vscode.window.showErrorMessage 
                : message.type === 'warning'
                ? vscode.window.showWarningMessage
                : vscode.window.showInformationMessage;
              notificationType(message.message);
            }
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    WebviewPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'assets', 'index.css')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
				<title>DevXCode</title>
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();
				</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

/**
 * Webview view provider for sidebar
 */
class WebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'devxcodeView';

  private _view?: vscode.WebviewView;

  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _storage: StorageService,
    private readonly _context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'out'),
        vscode.Uri.joinPath(this._extensionUri, 'out/webview'),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for theme changes
    const themeChangeDisposable = vscode.window.onDidChangeActiveColorTheme(() => {
      if (this._view) {
        this._view.webview.postMessage({
          command: 'themeChanged',
          theme: getVSCodeTheme(),
        });
      }
    });
    this._disposables.push(themeChangeDisposable);
    this._context.subscriptions.push(...this._disposables);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      (message: { command: string; key?: string; value?: unknown; message?: string; type?: string }) => {
        switch (message.command) {
          case 'getStorage':
            if (message.key) {
              this._storage.getValue(message.key).then((value) => {
                webviewView.webview.postMessage({
                  command: 'storageValue',
                  key: message.key,
                  value: value,
                });
              });
            }
            return;
          case 'setStorage':
            if (message.key !== undefined) {
              this._storage
                .setValue(message.key, message.value)
                .then(() => {
                  webviewView.webview.postMessage({
                    command: 'storageUpdated',
                    key: message.key,
                  });
                });
            }
            return;
          case 'getTheme':
            webviewView.webview.postMessage({
              command: 'themeChanged',
              theme: getVSCodeTheme(),
            });
            return;
          case 'showNotification':
            if (message.message) {
              const notificationType = message.type === 'error' 
                ? vscode.window.showErrorMessage 
                : message.type === 'warning'
                ? vscode.window.showWarningMessage
                : vscode.window.showInformationMessage;
              notificationType(message.message);
            }
            return;
        }
      }
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'assets', 'index.css')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
				<title>DevXCode</title>
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();
				</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
