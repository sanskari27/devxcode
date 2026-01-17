import { useEffect, useState } from 'react';

export interface VSCodeTheme {
  kind: 'light' | 'dark' | 'highContrast';
  colors: {
    [key: string]: string;
  };
}

declare const vscode: {
  postMessage: (message: unknown) => void;
};

export function useTheme() {
  const [theme, setTheme] = useState<VSCodeTheme | null>(null);

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'themeChanged') {
        setTheme(message.theme);
      }
    };

    window.addEventListener('message', handleMessage);

    // Request initial theme
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({ command: 'getTheme' });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return theme;
}
