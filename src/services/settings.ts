import {
  REPOSITORY_NAME_DENORMALIZE_REGEX,
  REPOSITORY_NAME_REMOVE_ACRONYMS,
  REPOSITORY_NAME_REMOVE_PATTERNS,
  STORAGE_KEYS,
} from '../lib/constants';
import type { ReleaseStatus } from './releases';
import { StorageService } from './storage';

/**
 * Repository denormalization strategy
 */
export type RepositoryDenormalizationStrategy =
  | 'none'
  | 'basic'
  | 'aggressive'
  | 'custom';

/**
 * Repository denormalization configuration
 */
export interface RepositoryDenormalizationConfig {
  strategy: RepositoryDenormalizationStrategy;
  customRegex?: string;
  removePatterns: string[];
  removeAcronyms: string[];
}

/**
 * Settings interface
 * Contains all customizable settings for the extension
 */
export interface Settings {
  releaseStatuses: ReleaseStatus[];
  repositoryDenormalization: RepositoryDenormalizationConfig;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: Settings = {
  releaseStatuses: [
    'Handover Completed',
    'Support Stamping',
    'Security Stamping',
  ],
  repositoryDenormalization: {
    strategy: 'aggressive',
    customRegex: REPOSITORY_NAME_DENORMALIZE_REGEX.source,
    removePatterns: [...REPOSITORY_NAME_REMOVE_PATTERNS],
    removeAcronyms: [...REPOSITORY_NAME_REMOVE_ACRONYMS],
  },
};

/**
 * Settings service for managing application settings
 * Provides methods to get and update settings
 */
export class SettingsService {
  private readonly STORAGE_KEY = STORAGE_KEYS.SETTINGS;

  constructor(private storage: StorageService) {}

  /**
   * Get settings from storage, or return defaults if not found
   * Migrates old settings that don't have repositoryDenormalization
   */
  async getSettings(): Promise<Settings> {
    const settings = await this.storage.getValue<Settings>(this.STORAGE_KEY);
    if (!settings) {
      return DEFAULT_SETTINGS;
    }

    // Migrate old settings that don't have repositoryDenormalization
    if (!settings.repositoryDenormalization) {
      const migratedSettings: Settings = {
        ...settings,
        repositoryDenormalization: DEFAULT_SETTINGS.repositoryDenormalization,
      };
      await this.storage.setValue(this.STORAGE_KEY, migratedSettings);
      return migratedSettings;
    }

    return settings;
  }

  /**
   * Update release statuses
   */
  async updateReleaseStatuses(statuses: ReleaseStatus[]): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings: Settings = {
      ...currentSettings,
      releaseStatuses: statuses,
    };
    await this.storage.setValue(this.STORAGE_KEY, updatedSettings);
  }

  /**
   * Update repository denormalization configuration
   */
  async updateRepositoryDenormalization(
    config: Partial<RepositoryDenormalizationConfig>
  ): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings: Settings = {
      ...currentSettings,
      repositoryDenormalization: {
        ...currentSettings.repositoryDenormalization,
        ...config,
      },
    };
    await this.storage.setValue(this.STORAGE_KEY, updatedSettings);
  }

  /**
   * Update all settings
   */
  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings: Settings = {
      ...currentSettings,
      ...settings,
    };
    await this.storage.setValue(this.STORAGE_KEY, updatedSettings);
  }
}
