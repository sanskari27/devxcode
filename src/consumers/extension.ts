import * as path from 'path';
import * as vscode from 'vscode';
import { STORAGE_KEYS } from '../lib/constants';
import { DumpsService } from '../services/dumps';
import { RepositoriesService } from '../services/repositories';
import { StorageService } from '../services/storage';
import { getVSCodeTheme } from '../services/theme';
import { UtilitiesService } from '../services/utilities';

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

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function handleMessage(
  message: Record<string, unknown>,
  postMessage: (message: unknown) => void,
  {
    storage,
    repositoriesService,
    dumpsService,
    context,
    extensionUri,
  }: {
    storage: StorageService;
    repositoriesService: RepositoriesService;
    dumpsService: DumpsService;
    context: vscode.ExtensionContext;
    extensionUri: vscode.Uri;
  }
) {
  console.log('handleMessage', message);
  handleStorageMessage(message, storage, postMessage);
  handleThemeMessage(message, postMessage);
  handleNotificationMessage(message);
  handleOpenRepositoryMessage(message, repositoriesService);
  handleOpenDumpEditorMessage(
    message,
    dumpsService,
    context,
    storage,
    postMessage
  );
  handleGitHelperMessage(message);
  handleOpenToolEditorMessage(message, context, extensionUri);
}

function handleStorageMessage(
  message: Record<string, unknown>,
  storage: StorageService,
  postMessage: (message: unknown) => void
) {
  switch (message.command) {
    case 'getStorage':
      storage.getValue(message.key as string).then(value => {
        postMessage({
          command: 'storageValue',
          key: message.key,
          value: value,
        });
      });

      return;
    case 'setStorage':
      storage
        .setValue(message.key as string, message.value as unknown)
        .then(() => {
          postMessage({
            command: 'storageUpdated',
            key: message.key,
          });
        });
      return;
  }
}

function handleThemeMessage(
  message: Record<string, unknown>,
  postMessage: (message: unknown) => void
) {
  switch (message.command) {
    case 'getTheme':
      postMessage({
        command: 'themeChanged',
        theme: getVSCodeTheme(),
      });
      return;
  }
}

function handleNotificationMessage(message: Record<string, unknown>) {
  switch (message.command) {
    case 'showNotification':
      if (message.message) {
        const notificationType =
          message.type === 'error'
            ? vscode.window.showErrorMessage
            : message.type === 'warning'
              ? vscode.window.showWarningMessage
              : vscode.window.showInformationMessage;
        notificationType(message.message as string);
      }
      return;
  }
}

function handleOpenRepositoryMessage(
  message: Record<string, unknown>,
  repositoriesService: RepositoriesService
) {
  switch (message.command) {
    case 'openRepository':
      if (message.path) {
        const uri = vscode.Uri.file(message.path as string);
        // Open folder in a new window
        vscode.commands.executeCommand('vscode.openFolder', uri, true).then(
          () => {
            // Update lastOpened when repository is opened
            repositoriesService
              .updateLastOpened(message.path as string)
              .catch(error => {
                console.error('Failed to update lastOpened:', error);
              });
          },
          error => {
            console.error('Failed to open repository:', error);
            vscode.window.showErrorMessage(
              `Failed to open repository: ${error}`
            );
          }
        );
      }
      return;
  }
}

async function handleOpenDumpEditorMessage(
  message: Record<string, unknown>,
  dumpsService: DumpsService,
  context: vscode.ExtensionContext,
  storage: StorageService,
  postMessage: (message: unknown) => void
) {
  switch (message.command) {
    case 'openDumpEditor':
      if (!message.dumpId || typeof message.dumpId !== 'string') {
        return;
      }
      vscode.window.showInformationMessage(
        `Opening dump editor for ${message.dumpId}`
      );
      try {
        const dumpId = message.dumpId as string;
        const dump = await dumpsService.getDumpById(dumpId);

        if (!dump) {
          vscode.window.showErrorMessage(`Dump with id ${dumpId} not found`);
          return;
        }

        // Ensure dumps directory exists
        const dumpsDir = vscode.Uri.joinPath(context.globalStorageUri, 'dumps');
        try {
          await vscode.workspace.fs.stat(dumpsDir);
        } catch {
          // Directory doesn't exist, create it
          await vscode.workspace.fs.createDirectory(dumpsDir);
        }

        // Create/update temp file
        const fileUri = vscode.Uri.joinPath(dumpsDir, `${dumpId}.txt`);
        const content = Buffer.from(dump.content, 'utf8');
        await vscode.workspace.fs.writeFile(fileUri, content);

        // Open file in editor
        const document = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(document, {
          preview: false,
        });

        // Set up save listener for this dump file
        const saveListener = vscode.workspace.onDidSaveTextDocument(
          async savedDocument => {
            if (savedDocument.uri.toString() === fileUri.toString()) {
              try {
                const savedContent = savedDocument.getText();
                await dumpsService.updateDump(dumpId, {
                  content: savedContent,
                });
                // Notify webview of storage update
                postMessage({
                  command: 'storageUpdated',
                  key: STORAGE_KEYS.DUMPS,
                });
              } catch (error) {
                console.error('Failed to update dump:', error);
                vscode.window.showErrorMessage(`Failed to save dump: ${error}`);
              }
            }
          }
        );

        // Store listener in context subscriptions (will be cleaned up on deactivation)
        context.subscriptions.push(saveListener);
      } catch (error) {
        console.error('Failed to open dump editor:', error);
        vscode.window.showErrorMessage(`Failed to open dump editor: ${error}`);
      }

      return;
  }
}

function handleGitHelperMessage(message: Record<string, unknown>) {
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

// Track open tool editors by toolId
const openToolEditors = new Map<string, vscode.WebviewPanel>();

async function handleOpenToolEditorMessage(
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
