import * as vscode from 'vscode';
import { DumpsService } from '../../services/dumps';
import { RepositoriesService } from '../../services/repositories';
import { StorageService } from '../../services/storage';
import { getVSCodeTheme } from '../../services/theme';
import { handleMessage } from '../handlers/messageHandlers';
import { getNonce } from '../utils/webviewUtils';

/**
 * Manages webview panels
 */
export class WebviewPanel {
    public static currentPanel: WebviewPanel | undefined;
    public static readonly viewType = 'devxcodeWebview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _storage: StorageService;
    private readonly _repositoriesService: RepositoriesService;
    private readonly _dumpsService: DumpsService;
    private readonly _context: vscode.ExtensionContext;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(
        extensionUri: vscode.Uri,
        storage: StorageService,
        repositoriesService: RepositoriesService,
        dumpsService: DumpsService,
        context: vscode.ExtensionContext
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

        WebviewPanel.currentPanel = new WebviewPanel(
            panel,
            extensionUri,
            storage,
            repositoriesService,
            dumpsService,
            context
        );
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        storage: StorageService,
        repositoriesService: RepositoriesService,
        dumpsService: DumpsService,
        context: vscode.ExtensionContext
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._storage = storage;
        this._repositoriesService = repositoriesService;
        this._dumpsService = dumpsService;
        this._context = context;

        // Set the webview's initial html content
        this._update();

        // Listen for theme changes
        const themeChangeDisposable = vscode.window.onDidChangeActiveColorTheme(
            () => {
                this._panel.webview.postMessage({
                    command: 'themeChanged',
                    theme: getVSCodeTheme(),
                });
            }
        );
        this._disposables.push(themeChangeDisposable);

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message: {
                command: string;
                key?: string;
                value?: unknown;
                message?: string;
                type?: string;
                path?: string;
            }) => {
                // Create a safe postMessage wrapper that handles errors gracefully
                const safePostMessage = (msg: unknown) => {
                    try {
                        if (this._panel) {
                            this._panel.webview.postMessage(msg);
                        }
                    } catch (error) {
                        // Webview might have been disposed, ignore the error
                        console.debug(
                            'Failed to post message to webview (may be disposed):',
                            error
                        );
                    }
                };
                handleMessage(message, safePostMessage, {
                    storage: this._storage,
                    repositoriesService: this._repositoriesService,
                    dumpsService: this._dumpsService,
                    context: this._context,
                    extensionUri: this._extensionUri,
                });
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
