import * as vscode from 'vscode';

export function handleNotificationMessage(message: Record<string, unknown>) {
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
