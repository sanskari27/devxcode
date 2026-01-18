import {
  STORAGE_KEYS,
  REPOSITORY_NAME_DENORMALIZE_REGEX,
} from '../lib/constants';
import { StorageService } from './storage';

/**
 * Repository interface
 * Represents a single repository with name, path, nickname, and last opened timestamp
 */
export interface Repository {
  name: string;
  path: string;
  nickname: string;
  lastOpened: string;
}

/**
 * Repositories service for managing repositories
 * Provides CRUD operations and automatic nickname generation
 */
export class RepositoriesService {
  private readonly STORAGE_KEY = STORAGE_KEYS.REPOSITORIES;

  constructor(private storage: StorageService) {}

  /**
   * Get all repositories from storage
   */
  private async _getAllRepositoriesData(): Promise<Repository[]> {
    const repositories = await this.storage.getValue<Repository[]>(
      this.STORAGE_KEY
    );
    return repositories ?? [];
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
   * Removes -, _, . and other special characters to generate a clean nickname
   */
  denormalizeName(name: string): string {
    return name.replace(REPOSITORY_NAME_DENORMALIZE_REGEX, ' ');
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

    const nickname = this.denormalizeName(name);
    const newRepository: Repository = {
      name,
      path,
      nickname,
      lastOpened: new Date().toISOString(),
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
}
