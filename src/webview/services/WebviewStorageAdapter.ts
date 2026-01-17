/**
 * Webview Storage Adapter
 * Implements the StorageService interface for use in webview context
 * Uses postMessage to communicate with the extension host
 */

declare const vscode: {
  postMessage: (message: unknown) => void;
};

/**
 * Storage adapter that bridges webview postMessage with StorageService interface
 * Allows services like ReleasesService to work in webview context
 */
export class WebviewStorageAdapter {
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
    }
  >();
  private boundHandleMessage: (event: MessageEvent) => void;

  constructor() {
    // Bind the message handler once and store it for cleanup
    this.boundHandleMessage = this.handleMessage.bind(this);
    // Listen for messages from extension
    window.addEventListener('message', this.boundHandleMessage);
  }

  /**
   * Handle incoming messages from extension
   */
  private handleMessage(event: MessageEvent): void {
    const message = event.data;

    if (message.command === 'storageValue') {
      const { key, value } = message;
      const requestId = this.getRequestId('get', key);
      const pending = this.pendingRequests.get(requestId);

      if (pending) {
        this.pendingRequests.delete(requestId);
        pending.resolve(value);
      }
    } else if (message.command === 'storageUpdated') {
      const { key } = message;
      const requestId = this.getRequestId('set', key);
      const pending = this.pendingRequests.get(requestId);

      if (pending) {
        this.pendingRequests.delete(requestId);
        pending.resolve(undefined);
      }
    }
  }

  /**
   * Generate a unique request ID for message correlation
   */
  private getRequestId(operation: 'get' | 'set', key: string): string {
    return `${operation}:${key}`;
  }

  /**
   * Get a value from storage
   * Matches StorageService.getValue interface
   */
  async getValue<T>(key: string): Promise<T | undefined> {
    if (typeof vscode === 'undefined') {
      throw new Error('vscode API is not available');
    }

    return new Promise<T | undefined>((resolve, reject) => {
      const requestId = this.getRequestId('get', key);

      // Set timeout for request
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Storage getValue timeout for key: ${key}`));
      }, 10000); // 10 second timeout

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve: (value: unknown) => {
          clearTimeout(timeout);
          resolve(value as T | undefined);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      // Send message to extension
      vscode.postMessage({
        command: 'getStorage',
        key,
      });
    });
  }

  /**
   * Set a value in storage
   * Matches StorageService.setValue interface
   */
  async setValue<T>(key: string, value: T): Promise<void> {
    if (typeof vscode === 'undefined') {
      throw new Error('vscode API is not available');
    }

    return new Promise<void>((resolve, reject) => {
      const requestId = this.getRequestId('set', key);

      // Set timeout for request
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Storage setValue timeout for key: ${key}`));
      }, 10000); // 10 second timeout

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve: () => {
          clearTimeout(timeout);
          resolve();
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      // Send message to extension
      vscode.postMessage({
        command: 'setStorage',
        key,
        value,
      });
    });
  }

  /**
   * Cleanup method to remove event listeners
   * Should be called when adapter is no longer needed
   */
  dispose(): void {
    window.removeEventListener('message', this.boundHandleMessage);
    // Reject all pending requests
    for (const [requestId, pending] of this.pendingRequests.entries()) {
      pending.reject(new Error(`Storage adapter disposed, request cancelled: ${requestId}`));
    }
    this.pendingRequests.clear();
  }
}
