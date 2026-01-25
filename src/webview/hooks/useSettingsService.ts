import { STORAGE_KEYS } from '@lib/constants';
import type {
  ReleaseStatus,
  RepositoryDenormalizationConfig,
  Settings,
} from '@services/settings';
import { SettingsService } from '@services/settings';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebviewStorageAdapter } from '../services/WebviewStorageAdapter';

/**
 * Hook to manage settings using SettingsService
 * Uses WebviewStorageAdapter to bridge webview postMessage with the service
 */
export function useSettingsService() {
  const [settings, setSettings] = useState<Settings | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Create adapter and service instances (memoized to avoid recreating)
  const { adapter, service } = useMemo(() => {
    const storageAdapter = new WebviewStorageAdapter();
    const settingsService = new SettingsService(storageAdapter as any);
    return {
      adapter: storageAdapter,
      service: settingsService,
    };
  }, []);

  // Load initial settings
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const allSettings = await service.getSettings();
        if (isMounted) {
          setSettings(allSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    // Listen for storage updates from extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (
        message.command === 'storageUpdated' &&
        message.key === STORAGE_KEYS.SETTINGS
      ) {
        // Reload settings when storage is updated
        loadSettings();
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

  const getSettings = useCallback(async (): Promise<Settings> => {
    const allSettings = await service.getSettings();
    setSettings(allSettings);
    return allSettings;
  }, [service]);

  const updateReleaseStatuses = useCallback(
    async (statuses: ReleaseStatus[]): Promise<void> => {
      await service.updateReleaseStatuses(statuses);
      // Refresh settings from service
      const allSettings = await service.getSettings();
      setSettings(allSettings);
    },
    [service]
  );

  const updateRepositoryDenormalization = useCallback(
    async (config: Partial<RepositoryDenormalizationConfig>): Promise<void> => {
      await service.updateRepositoryDenormalization(config);
      // Refresh settings from service
      const allSettings = await service.getSettings();
      setSettings(allSettings);
    },
    [service]
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<Settings>): Promise<void> => {
      await service.updateSettings(newSettings);
      // Refresh settings from service
      const allSettings = await service.getSettings();
      setSettings(allSettings);
    },
    [service]
  );

  return {
    settings,
    releaseStatuses: settings?.releaseStatuses ?? [],
    repositoryDenormalization:
      settings?.repositoryDenormalization ??
      ({
        strategy: 'aggressive',
        removePatterns: [],
        removeAcronyms: [],
      } as RepositoryDenormalizationConfig),
    isLoading,
    getSettings,
    updateReleaseStatuses,
    updateRepositoryDenormalization,
    updateSettings,
  };
}
