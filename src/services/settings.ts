import { STORAGE_KEYS } from '../lib/constants';
import type { ReleaseStatus } from './releases';
import { StorageService } from './storage';

/**
 * Settings interface
 * Contains all customizable settings for the extension
 */
export interface Settings {
  releaseStatuses: ReleaseStatus[];
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
   */
  async getSettings(): Promise<Settings> {
    const settings = await this.storage.getValue<Settings>(this.STORAGE_KEY);
    return settings ?? DEFAULT_SETTINGS;
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
