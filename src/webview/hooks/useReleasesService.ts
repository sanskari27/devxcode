import { STORAGE_KEYS } from '@lib/constants';
import type { Change, Release, ReleaseProgress } from '@services/releases';
import { ReleasesService } from '@services/releases';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebviewStorageAdapter } from '../services/WebviewStorageAdapter';

/**
 * Hook to manage releases using ReleasesService
 * Uses WebviewStorageAdapter to bridge webview postMessage with the service
 */
export function useReleasesService() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create adapter and service instances (memoized to avoid recreating)
  const { adapter, service } = useMemo(() => {
    const storageAdapter = new WebviewStorageAdapter();
    const releasesService = new ReleasesService(storageAdapter as any);
    return {
      adapter: storageAdapter,
      service: releasesService,
    };
  }, []);

  // Load initial releases
  useEffect(() => {
    let isMounted = true;

    const loadReleases = async () => {
      try {
        setIsLoading(true);
        const allReleases = await service.getAllReleases();
        if (isMounted) {
          setReleases(allReleases);
        }
      } catch (error) {
        console.error('Failed to load releases:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReleases();

    // Listen for storage updates from extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'storageUpdated' && message.key === STORAGE_KEYS.RELEASES) {
        // Reload releases when storage is updated
        loadReleases();
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

  const getAllReleases = useCallback(async (): Promise<Release[]> => {
    const allReleases = await service.getAllReleases();
    setReleases(allReleases);
    return allReleases;
  }, [service]);

  const createRelease = useCallback(
    async (release: Omit<Release, 'id'>): Promise<Release> => {
      const newRelease = await service.createRelease(release);
      // Refresh releases from service
      const allReleases = await service.getAllReleases();
      setReleases(allReleases);
      return newRelease;
    },
    [service]
  );

  const updateRelease = useCallback(
    async (id: string, updates: Partial<Omit<Release, 'id'>>): Promise<Release> => {
      const updatedRelease = await service.updateRelease(id, updates);
      // Refresh releases from service
      const allReleases = await service.getAllReleases();
      setReleases(allReleases);
      return updatedRelease;
    },
    [service]
  );

  const deleteRelease = useCallback(
    async (id: string): Promise<void> => {
      await service.deleteRelease(id);
      // Refresh releases from service
      const allReleases = await service.getAllReleases();
      setReleases(allReleases);
    },
    [service]
  );

  const addChangeToRelease = useCallback(
    async (releaseId: string, change: Omit<Change, 'id'>): Promise<Change> => {
      const newChange = await service.addChangeToRelease(releaseId, change);
      // Refresh releases from service
      const allReleases = await service.getAllReleases();
      setReleases(allReleases);
      return newChange;
    },
    [service]
  );

  const updateChangeInRelease = useCallback(
    async (
      releaseId: string,
      changeId: string,
      updates: Partial<Omit<Change, 'id'>>
    ): Promise<Change> => {
      const updatedChange = await service.updateChangeInRelease(releaseId, changeId, updates);
      // Refresh releases from service
      const allReleases = await service.getAllReleases();
      setReleases(allReleases);
      return updatedChange;
    },
    [service]
  );

  const getReleaseProgress = useCallback(
    async (releaseId: string): Promise<ReleaseProgress> => {
      return service.getReleaseProgress(releaseId);
    },
    [service]
  );

  const getChangeProgress = useCallback((change: Change): { completed: number; total: number } => {
    const statusKeys = Object.keys(change.statusChecklist);
    const total = statusKeys.length;
    const completed = statusKeys.filter(
      (key) => change.statusChecklist[key as keyof typeof change.statusChecklist]
    ).length;
    return { completed, total };
  }, []);

  const getReleaseProgressSync = useCallback((release: Release): ReleaseProgress => {
    if (release.changes.length === 0) {
      return {
        percentage: 0,
        totalItems: 0,
        completedItems: 0,
      };
    }

    let totalItems = 0;
    let completedItems = 0;

    for (const change of release.changes) {
      const statusKeys = Object.keys(change.statusChecklist) as Array<keyof typeof change.statusChecklist>;
      totalItems += statusKeys.length;

      for (const status of statusKeys) {
        if (change.statusChecklist[status]) {
          completedItems++;
        }
      }
    }

    const percentage =
      totalItems > 0 && completedItems > 0 ? Math.round((completedItems / totalItems) * 100 * 100) / 100 : 0;

    return {
      percentage,
      totalItems,
      completedItems,
    };
  }, []);

  return {
    releases,
    isLoading,
    getAllReleases,
    createRelease,
    updateRelease,
    deleteRelease,
    addChangeToRelease,
    updateChangeInRelease,
    getReleaseProgress,
    getChangeProgress,
    getReleaseProgressSync,
  };
}
