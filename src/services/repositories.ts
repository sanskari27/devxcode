import {
  REPOSITORY_NAME_DENORMALIZE_REGEX,
  STORAGE_KEYS,
} from '../lib/constants';
import type { RepositoryDenormalizationConfig } from './settings';
import { SettingsService } from './settings';
import { StorageService } from './storage';

/**
 * Repository interface
 * Represents a single repository with name, path, nickname, last opened timestamp, and pinned status
 */
export interface Repository {
  name: string;
  path: string;
  nickname: string;
  lastOpened: string;
  pinned: boolean;
}

/**
 * Repositories service for managing repositories
 * Provides CRUD operations and automatic nickname generation
 */
export class RepositoriesService {
  private readonly STORAGE_KEY = STORAGE_KEYS.REPOSITORIES;

  constructor(
    private storage: StorageService,
    private settingsService?: SettingsService
  ) {}

  /**
   * Get all repositories from storage
   * Migrates old repositories to include pinned field if missing
   */
  private async _getAllRepositoriesData(): Promise<Repository[]> {
    const repositories = await this.storage.getValue<Repository[]>(
      this.STORAGE_KEY
    );
    if (!repositories) {
      return [];
    }

    // Migrate old repositories that don't have pinned field
    const needsMigration = repositories.some(repo => repo.pinned === undefined);
    if (needsMigration) {
      const migratedRepositories = repositories.map(repo => ({
        ...repo,
        pinned: repo.pinned ?? false,
      }));
      await this._saveAllRepositoriesData(migratedRepositories);
      return migratedRepositories;
    }

    return repositories;
  }

  /**
   * Save all repositories to storage
   */
  private async _saveAllRepositoriesData(
    repositories: Repository[]
  ): Promise<void> {
    await this.storage.setValue(this.STORAGE_KEY, repositories);
  }

  /**
   * Denormalize repository name by removing special characters
   * Removes alphanumeric codes, hardcoded acronyms, and special characters to generate a clean nickname
   * Uses settings if available, otherwise falls back to defaults
   */
  async denormalizeName(
    name: string,
    config?: RepositoryDenormalizationConfig
  ): Promise<string> {
    // Get config from parameter, settings service, or defaults
    let denormalizationConfig: RepositoryDenormalizationConfig;
    if (config) {
      denormalizationConfig = config;
    } else if (this.settingsService) {
      const settings = await this.settingsService.getSettings();
      denormalizationConfig = settings.repositoryDenormalization;
    } else {
      // Fallback to defaults (aggressive strategy)
      denormalizationConfig = {
        strategy: 'aggressive',
        customRegex: REPOSITORY_NAME_DENORMALIZE_REGEX.source,
        removePatterns: [],
        removeAcronyms: [],
      };
    }

    return this._denormalizeNameWithConfig(name, denormalizationConfig);
  }

  /**
   * Internal method to denormalize name with a specific config
   */
  private _denormalizeNameWithConfig(
    name: string,
    config: RepositoryDenormalizationConfig
  ): string {
    const { strategy, customRegex, removePatterns, removeAcronyms } = config;

    // Strategy: none - return as-is
    if (strategy === 'none') {
      return name;
    }

    let result = name;
    let regex: RegExp;

    // Determine regex based on strategy
    if (strategy === 'custom' && customRegex) {
      try {
        regex = new RegExp(customRegex, 'g');
      } catch (error) {
        // If invalid regex, fall back to default
        console.error('Invalid custom regex, using default:', error);
        regex = REPOSITORY_NAME_DENORMALIZE_REGEX;
      }
    } else {
      regex = REPOSITORY_NAME_DENORMALIZE_REGEX;
    }

    // Strategy: basic - only replace special characters
    if (strategy === 'basic') {
      result = result.replace(regex, ' ');
      result = result.replace(/\s+/g, ' ').trim();
      return result;
    }

    // Strategy: aggressive or custom - full denormalization
    result = result.replace(regex, ' ');

    // Remove patterns (e.g., "TSWM123", "TAPP456")
    if (removePatterns.length > 0) {
      const prefixPattern = removePatterns
        .map(prefix => prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex characters
        .join('|');
      const codeRegex = new RegExp(
        `\\b(${prefixPattern})\\d+(?=[-_.]|\\b|$)`,
        'gi'
      );
      result = result.replace(codeRegex, '');
    }

    // Remove acronyms
    if (removeAcronyms.length > 0) {
      for (const acronym of removeAcronyms) {
        const acronymRegex = new RegExp(`\\b${acronym}\\b`, 'gi');
        result = result.replace(acronymRegex, '');
      }
    }

    // Replace special characters again and clean up whitespace
    result = result.replace(regex, ' ');
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * Get all repositories
   */
  async getAllRepositories(): Promise<Repository[]> {
    return this._getAllRepositoriesData();
  }

  /**
   * Find a repository by path
   */
  async findRepositoryByPath(path: string): Promise<Repository | undefined> {
    const repositories = await this._getAllRepositoriesData();
    return repositories.find(repo => repo.path === path);
  }

  /**
   * Add a new repository
   * Automatically generates nickname from name
   */
  async addRepository(name: string, path: string): Promise<Repository> {
    const repositories = await this._getAllRepositoriesData();

    // Check if repository already exists by path
    const existingRepo = repositories.find(repo => repo.path === path);
    if (existingRepo) {
      // Update lastOpened if it already exists
      return this.updateLastOpened(path);
    }

    const nickname = await this.denormalizeName(name);
    const newRepository: Repository = {
      name,
      path,
      nickname,
      lastOpened: new Date().toISOString(),
      pinned: false,
    };

    repositories.push(newRepository);
    await this._saveAllRepositoriesData(repositories);
    return newRepository;
  }

  /**
   * Remove a repository by path
   */
  async removeRepository(path: string): Promise<void> {
    const repositories = await this._getAllRepositoriesData();
    const filteredRepositories = repositories.filter(
      repo => repo.path !== path
    );

    if (filteredRepositories.length === repositories.length) {
      throw new Error(`Repository with path ${path} not found`);
    }

    await this._saveAllRepositoriesData(filteredRepositories);
  }

  /**
   * Update the lastOpened timestamp for a repository
   */
  async updateLastOpened(path: string): Promise<Repository> {
    const repositories = await this._getAllRepositoriesData();
    const index = repositories.findIndex(repo => repo.path === path);

    if (index === -1) {
      throw new Error(`Repository with path ${path} not found`);
    }

    repositories[index] = {
      ...repositories[index],
      lastOpened: new Date().toISOString(),
    };

    await this._saveAllRepositoriesData(repositories);
    return repositories[index];
  }

  /**
   * Add or update a repository
   * If repository exists by path, update lastOpened
   * If not, add new repository
   */
  async addOrUpdateRepository(name: string, path: string): Promise<Repository> {
    const existingRepo = await this.findRepositoryByPath(path);
    if (existingRepo) {
      return this.updateLastOpened(path);
    } else {
      return this.addRepository(name, path);
    }
  }

  /**
   * Pin a repository by path
   */
  async pinRepository(path: string): Promise<Repository> {
    const repositories = await this._getAllRepositoriesData();
    const index = repositories.findIndex(repo => repo.path === path);

    if (index === -1) {
      throw new Error(`Repository with path ${path} not found`);
    }

    repositories[index] = {
      ...repositories[index],
      pinned: true,
    };

    await this._saveAllRepositoriesData(repositories);
    return repositories[index];
  }

  /**
   * Unpin a repository by path
   */
  async unpinRepository(path: string): Promise<Repository> {
    const repositories = await this._getAllRepositoriesData();
    const index = repositories.findIndex(repo => repo.path === path);

    if (index === -1) {
      throw new Error(`Repository with path ${path} not found`);
    }

    repositories[index] = {
      ...repositories[index],
      pinned: false,
    };

    await this._saveAllRepositoriesData(repositories);
    return repositories[index];
  }

  /**
   * Toggle pin status of a repository
   */
  async togglePinRepository(path: string): Promise<Repository> {
    const repository = await this.findRepositoryByPath(path);
    if (!repository) {
      throw new Error(`Repository with path ${path} not found`);
    }

    if (repository.pinned) {
      return this.unpinRepository(path);
    } else {
      return this.pinRepository(path);
    }
  }
}
