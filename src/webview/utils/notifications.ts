declare const vscode: {
  postMessage: (message: unknown) => void;
};

/**
 * Show a VS Code notification from the webview
 * Note: VS Code only supports 'info', 'warning', and 'error' types.
 * 'success' is mapped to 'info'.
 */
export function showNotification(
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info'
): void {
  if (typeof vscode !== 'undefined') {
    // Map 'success' to 'info' since VS Code doesn't have a success notification type
    const notificationType = type === 'success' ? 'info' : type;
    vscode.postMessage({
      command: 'showNotification',
      message,
      type: notificationType,
    });
  }
}
