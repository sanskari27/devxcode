import { UtilitiesService } from '@services/utilities';
import { useCallback, useMemo } from 'react';

declare const vscode: {
  postMessage: (message: unknown) => void;
};

/**
 * Hook to manage utilities using UtilitiesService
 * Provides access to tool groups and opens tool editor
 */
export function useUtilitiesService() {
  // Create service instance (memoized to avoid recreating)
  const service = useMemo(() => {
    return new UtilitiesService();
  }, []);

  /**
   * Get all tool groups
   */
  const toolGroups = useMemo(() => {
    return service.getAllToolGroups();
  }, [service]);

  /**
   * Open tool editor webview
   */
  const openToolEditor = useCallback((toolId: string): void => {
    // Send message to extension to open tool editor
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'openToolEditor',
        toolId,
      });
    }
  }, []);

  return {
    toolGroups,
    openToolEditor,
    service,
  };
}
