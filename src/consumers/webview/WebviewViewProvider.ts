import * as vscode from 'vscode';
import { DumpsService } from '../../services/dumps';
import { RepositoriesService } from '../../services/repositories';
import { StorageService } from '../../services/storage';
import { getVSCodeTheme } from '../../services/theme';
import { handleMessage } from '../handlers/messageHandlers';
import { getNonce } from '../utils/webviewUtils';

/**
 * Webview view provider for sidebar
 */
export class WebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'devxcodeView';

  private _view?: vscode.WebviewView;

  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _storage: StorageService,
    private readonly _context: vscode.ExtensionContext,
    private readonly _repositoriesService: RepositoriesService,
    private readonly _dumpsService: DumpsService
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
    const themeChangeDisposable = vscode.window.onDidChangeActiveColorTheme(
      () => {
        if (this._view) {
          this._view.webview.postMessage({
            command: 'themeChanged',
            theme: getVSCodeTheme(),
          });
        }
      }
    );
    this._disposables.push(themeChangeDisposable);
    this._context.subscriptions.push(...this._disposables);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      (message: {
        command: string;
        key?: string;
        value?: unknown;
        message?: string;
        type?: string;
        path?: string;
      }) => {
        // Create a safe postMessage wrapper that checks if view is still valid
        const safePostMessage = (msg: unknown) => {
          try {
            if (this._view && this._view.webview) {
              this._view.webview.postMessage(msg);
            }
          } catch (error) {
            console.error('Failed to post message to webview:', error);
          }
        };
        handleMessage(message, safePostMessage, {
          storage: this._storage,
          repositoriesService: this._repositoriesService,
          dumpsService: this._dumpsService,
          context: this._context,
          extensionUri: this._extensionUri,
        });
      }
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'out',
        'webview',
        'assets',
        'index.js'
      )
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'out',
        'webview',
        'assets',
        'index.css'
      )
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
