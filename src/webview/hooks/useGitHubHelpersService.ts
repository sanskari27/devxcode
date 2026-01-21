import { GitHubHelpersService } from '@services/githubHelpers';
import { useCallback, useMemo } from 'react';

declare const vscode: {
  postMessage: (message: unknown) => void;
};

/**
 * Hook to manage GitHub helpers using GitHubHelpersService
 * Provides access to predefined git helper functions
 */
export function useGitHubHelpersService() {
  // Create service instance (memoized to avoid recreating)
  const service = useMemo(() => {
    return new GitHubHelpersService();
  }, []);

  /**
   * Get all helpers
   */
  const helpers = useMemo(() => {
    return service.getAllHelpers();
  }, [service]);

  /**
   * Execute a git helper command
   */
  const executeHelper = useCallback(
    (helperId: string, input?: string): void => {
      const helper = service.getHelperById(helperId);
      if (!helper) {
        console.error(`Helper with id ${helperId} not found`);
        return;
      }

      try {
        // Build command from template
        const command = service.buildCommand(helper, input);

        // Send message to extension to execute command
        if (typeof vscode !== 'undefined') {
          vscode.postMessage({
            command: 'executeGitHelper',
            gitCommand: command,
          });
        }
      } catch (error) {
        console.error('Failed to execute helper:', error);
        // Error will be shown via notification in the component
        throw error;
      }
    },
    [service]
  );

  /**
   * Open backmerge webview
   */
  const openBackmergeWebview = useCallback((): void => {
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'openBackmergeWebview',
      });
    }
  }, []);

  return {
    helpers,
    executeHelper,
    openBackmergeWebview,
  };
}
