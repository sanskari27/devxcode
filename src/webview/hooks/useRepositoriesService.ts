import { STORAGE_KEYS } from '@lib/constants';
import type { Repository } from '@services/repositories';
import { RepositoriesService } from '@services/repositories';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebviewStorageAdapter } from '../services/WebviewStorageAdapter';

declare const vscode: {
  postMessage: (message: unknown) => void;
};

/**
 * Hook to manage repositories using RepositoriesService
 * Uses WebviewStorageAdapter to bridge webview postMessage with the service
 */
export function useRepositoriesService() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create adapter and service instances (memoized to avoid recreating)
  const { adapter, service } = useMemo(() => {
    const storageAdapter = new WebviewStorageAdapter();
    const repositoriesService = new RepositoriesService(storageAdapter as any);
    return {
      adapter: storageAdapter,
      service: repositoriesService,
    };
  }, []);

  // Load initial repositories
  useEffect(() => {
    let isMounted = true;

    const loadRepositories = async () => {
      try {
        setIsLoading(true);
        const allRepositories = await service.getAllRepositories();
        if (isMounted) {
          setRepositories(allRepositories);
        }
      } catch (error) {
        console.error('Failed to load repositories:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRepositories();

    // Listen for storage updates from extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (
        message.command === 'storageUpdated' &&
        message.key === STORAGE_KEYS.REPOSITORIES
      ) {
        // Reload repositories when storage is updated
        loadRepositories();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      isMounted = false;
      window.removeEventListener('message', handleMessage);
    };
  }, [service]);

  // Cleanup adapter on unmount
  useEffect(() => {
    return () => {
      adapter.dispose();
    };
  }, [adapter]);

  const getAllRepositories = useCallback(async (): Promise<Repository[]> => {
    const allRepositories = await service.getAllRepositories();
    setRepositories(allRepositories);
    return allRepositories;
  }, [service]);

  const addRepository = useCallback(
    async (name: string, path: string): Promise<Repository> => {
      const newRepository = await service.addRepository(name, path);
      // Refresh repositories from service
      const allRepositories = await service.getAllRepositories();
      setRepositories(allRepositories);
      return newRepository;
    },
    [service]
  );

  const removeRepository = useCallback(
    async (path: string): Promise<void> => {
      await service.removeRepository(path);
      // Refresh repositories from service
      const allRepositories = await service.getAllRepositories();
      setRepositories(allRepositories);
    },
    [service]
  );

  const openRepository = useCallback(
    async (path: string): Promise<void> => {
      // Send message to extension to open repository
      if (typeof vscode !== 'undefined') {
        vscode.postMessage({
          command: 'openRepository',
          path,
        });
        // Update lastOpened after opening
        try {
          await service.updateLastOpened(path);
          const allRepositories = await service.getAllRepositories();
          setRepositories(allRepositories);
        } catch (error) {
          console.error('Failed to update lastOpened:', error);
        }
      }
    },
    [service]
  );

  const openGitHubRepository = useCallback((path: string): void => {
    // Send message to extension to open GitHub repository
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'openGitHubRepository',
        path,
      });
    }
  }, []);

  return {
    repositories,
    isLoading,
    getAllRepositories,
    addRepository,
    removeRepository,
    openRepository,
    openGitHubRepository,
  };
}
