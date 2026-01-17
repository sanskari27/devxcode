import { STORAGE_KEYS } from '../lib/constants';
import { StorageService } from './storage';

/**
 * Release status checklist items
 * These represent the deployment stages for each change
 */
export type ReleaseStatus =
  | 'Handover Completed'
  | 'Support Stamping'
  | 'Security Stamping' | string;

/**
 * Change interface
 * Represents a single change in a release with its process (status checklist)
 */
export interface Change {
  id: string;
  repoName: string;
  description: string;
  statusChecklist: Record<ReleaseStatus, boolean>;
}

/**
 * Release interface
 * Represents a release with its changes
 */
export interface Release {
  id: string;
  name: string;
  date: string;
  changes: Change[];
}

/**
 * Release progress interface
 * Calculated progress based on all changes' checklist items
 */
export interface ReleaseProgress {
  percentage: number;
  totalItems: number;
  completedItems: number;
}

/**
 * Default status checklist with all items set to false
 */
const DEFAULT_STATUS_CHECKLIST: Record<ReleaseStatus, boolean> = {
  'Handover Completed': false,
  'Support Stamping': false,
  'Security Stamping': false,
};

/**
 * Releases service for managing releases and changes
 * Provides CRUD operations and progress tracking
 */
export class ReleasesService {
  private readonly STORAGE_KEY = STORAGE_KEYS.RELEASES;

  constructor(
    private storage: StorageService) {}

  /**
   * Generate a unique ID using timestamp and random string
   */
  private _generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return `${timestamp}-${randomStr}`;
  }

  /**
   * Get all releases from storage
   */
  private async _getAllReleasesData(): Promise<Release[]> {
    const releases = await this.storage.getValue<Release[]>(this.STORAGE_KEY);
    return releases ?? [];
  }

  /**
   * Save all releases to storage
   */
  private async _saveAllReleasesData(releases: Release[]): Promise<void> {
    await this.storage.setValue(this.STORAGE_KEY, releases);
  }

  /**
   * Get all releases
   */
  async getAllReleases(): Promise<Release[]> {
    return this._getAllReleasesData();
  }

  /**
   * Get a release by ID
   */
  async getReleaseById(id: string): Promise<Release | undefined> {
    const releases = await this._getAllReleasesData();
    return releases.find((release) => release.id === id);
  }

  /**
   * Create a new release
   */
  async createRelease(release: Omit<Release, 'id'>): Promise<Release> {
    const releases = await this._getAllReleasesData();
    const newRelease: Release = {
      ...release,
      id: this._generateId(),
    };
    releases.push(newRelease);
    await this._saveAllReleasesData(releases);
    return newRelease;
  }

  /**
   * Update an existing release
   */
  async updateRelease(
    id: string,
    updates: Partial<Omit<Release, 'id'>>
  ): Promise<Release> {
    const releases = await this._getAllReleasesData();
    const index = releases.findIndex((release) => release.id === id);

    if (index === -1) {
      throw new Error(`Release with id ${id} not found`);
    }

    releases[index] = {
      ...releases[index],
      ...updates,
      id: releases[index].id, // Ensure ID is not overwritten
    };

    await this._saveAllReleasesData(releases);
    return releases[index];
  }

  /**
   * Delete a release
   */
  async deleteRelease(id: string): Promise<void> {
    const releases = await this._getAllReleasesData();
    const filteredReleases = releases.filter((release) => release.id !== id);

    if (filteredReleases.length === releases.length) {
      throw new Error(`Release with id ${id} not found`);
    }

    await this._saveAllReleasesData(filteredReleases);
  }

  /**
   * Calculate and return release progress
   * Progress is calculated from all changes' checklist items
   */
  async getReleaseProgress(releaseId: string): Promise<ReleaseProgress> {
    const release = await this.getReleaseById(releaseId);

    if (!release) {
      throw new Error(`Release with id ${releaseId} not found`);
    }

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
      const statusKeys = Object.keys(change.statusChecklist) as ReleaseStatus[];
      totalItems += statusKeys.length;

      for (const status of statusKeys) {
        if (change.statusChecklist[status]) {
          completedItems++;
        }
      }
    }

    const percentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100 * 100) / 100 : 0;

    return {
      percentage,
      totalItems,
      completedItems,
    };
  }

  /**
   * Add a change to a release
   */
  async addChangeToRelease(
    releaseId: string,
    change: Omit<Change, 'id'>
  ): Promise<Change> {
    const releases = await this._getAllReleasesData();
    const releaseIndex = releases.findIndex((r) => r.id === releaseId);

    if (releaseIndex === -1) {
      throw new Error(`Release with id ${releaseId} not found`);
    }

    const newChange: Change = {
      ...change,
      id: this._generateId(),
      // Ensure all status checklist items are present
      statusChecklist: {
        ...DEFAULT_STATUS_CHECKLIST,
        ...change.statusChecklist,
      },
    };

    releases[releaseIndex].changes.push(newChange);
    await this._saveAllReleasesData(releases);

    return newChange;
  }

  /**
   * Update a change in a release
   */
  async updateChangeInRelease(
    releaseId: string,
    changeId: string,
    updates: Partial<Omit<Change, 'id'>>
  ): Promise<Change> {
    const releases = await this._getAllReleasesData();
    const releaseIndex = releases.findIndex((r) => r.id === releaseId);

    if (releaseIndex === -1) {
      throw new Error(`Release with id ${releaseId} not found`);
    }

    const changeIndex = releases[releaseIndex].changes.findIndex(
      (c) => c.id === changeId
    );

    if (changeIndex === -1) {
      throw new Error(`Change with id ${changeId} not found in release ${releaseId}`);
    }

    const existingChange = releases[releaseIndex].changes[changeIndex];

    // Merge status checklist updates
    const updatedStatusChecklist = updates.statusChecklist
      ? {
          ...existingChange.statusChecklist,
          ...updates.statusChecklist,
        }
      : existingChange.statusChecklist;

    releases[releaseIndex].changes[changeIndex] = {
      ...existingChange,
      ...updates,
      id: existingChange.id, // Ensure ID is not overwritten
      statusChecklist: updatedStatusChecklist,
    };

    await this._saveAllReleasesData(releases);

    return releases[releaseIndex].changes[changeIndex];
  }

  /**
   * Delete a change from a release
   */
  async deleteChangeFromRelease(
    releaseId: string,
    changeId: string
  ): Promise<void> {
    const releases = await this._getAllReleasesData();
    const releaseIndex = releases.findIndex((r) => r.id === releaseId);

    if (releaseIndex === -1) {
      throw new Error(`Release with id ${releaseId} not found`);
    }

    const initialLength = releases[releaseIndex].changes.length;
    releases[releaseIndex].changes = releases[releaseIndex].changes.filter(
      (c) => c.id !== changeId
    );

    if (releases[releaseIndex].changes.length === initialLength) {
      throw new Error(`Change with id ${changeId} not found in release ${releaseId}`);
    }

    await this._saveAllReleasesData(releases);
  }
}
