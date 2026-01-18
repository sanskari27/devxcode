import { STORAGE_KEYS } from '@lib/constants';
import type { Dump } from '@services/dumps';
import { DumpsService } from '@services/dumps';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebviewStorageAdapter } from '../services/WebviewStorageAdapter';

declare const vscode: {
  postMessage: (message: unknown) => void;
};

/**
 * Hook to manage dumps using DumpsService
 * Uses WebviewStorageAdapter to bridge webview postMessage with the service
 */
export function useDumpsService() {
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create adapter and service instances (memoized to avoid recreating)
  const { adapter, service } = useMemo(() => {
    const storageAdapter = new WebviewStorageAdapter();
    const dumpsService = new DumpsService(storageAdapter as any);
    return {
      adapter: storageAdapter,
      service: dumpsService,
    };
  }, []);

  // Load initial dumps
  useEffect(() => {
    let isMounted = true;

    const loadDumps = async () => {
      try {
        setIsLoading(true);
        const allDumps = await service.getAllDumps();
        if (isMounted) {
          setDumps(allDumps);
        }
      } catch (error) {
        console.error('Failed to load dumps:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDumps();

    // Listen for storage updates from extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (
        message.command === 'storageUpdated' &&
        message.key === STORAGE_KEYS.DUMPS
      ) {
        // Reload dumps when storage is updated
        loadDumps();
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

  const openDumpEditor = useCallback((dumpId: string): void => {
    // Send message to extension to open dump editor
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'openDumpEditor',
        dumpId,
      });
    }
  }, []);

  const getAllDumps = useCallback(async (): Promise<Dump[]> => {
    const allDumps = await service.getAllDumps();
    setDumps(allDumps);
    return allDumps;
  }, [service]);

  const createDump = useCallback(
    async (dump: Omit<Dump, 'id'>): Promise<Dump> => {
      const newDump = await service.createDump(dump);
      const allDumps = await service.getAllDumps();
      setDumps(allDumps);
      return newDump;
    },
    [service]
  );

  const updateDump = useCallback(
    async (id: string, updates: Partial<Omit<Dump, 'id'>>): Promise<Dump> => {
      const updatedDump = await service.updateDump(id, updates);
      // Refresh dumps from service
      const allDumps = await service.getAllDumps();
      setDumps(allDumps);
      return updatedDump;
    },
    [service]
  );

  const deleteDump = useCallback(
    async (id: string): Promise<void> => {
      await service.deleteDump(id);
      // Refresh dumps from service
      const allDumps = await service.getAllDumps();
      setDumps(allDumps);
    },
    [service]
  );

  return {
    dumps,
    isLoading,
    getAllDumps,
    createDump,
    updateDump,
    deleteDump,
    openDumpEditor,
  };
}
