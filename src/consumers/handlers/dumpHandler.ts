import * as vscode from 'vscode';
import { STORAGE_KEYS } from '../../lib/constants';
import { DumpsService } from '../../services/dumps';
import { StorageService } from '../../services/storage';

export async function handleOpenDumpEditorMessage(
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
