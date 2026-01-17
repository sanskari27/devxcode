import { useCallback, useEffect, useState } from 'react';

declare const vscode: {
  postMessage: (message: unknown) => void;
};

/**
 * Hook to interact with VS Code storage from the webview
 */
export function useStorage<T>(key: string): [T | undefined, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'storageValue' && message.key === key) {
        setValue(message.value);
      } else if (message.command === 'storageUpdated' && message.key === key) {
        // Refetch the value after update
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({ command: 'getStorage', key });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Request initial value
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({ command: 'getStorage', key });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [key]);

  const setStorageValue = useCallback(
    async (newValue: T) => {
      if (typeof vscode !== 'undefined') {
        vscode.postMessage({ command: 'setStorage', key, value: newValue });
        // Optimistically update local state
        setValue(newValue);
      }
    },
    [key]
  );

  return [value, setStorageValue];
}
