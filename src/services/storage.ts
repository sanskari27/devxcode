import { Memento } from 'vscode';

/**
 * Storage service wrapper for VS Code Memento API
 * Provides type-safe methods for storing and retrieving data
 * Defaults to global storage (persists across all workspaces)
 */
export class StorageService {
  constructor(
    private workspaceState: Memento,
    private globalState: Memento
  ) { }


  private getKey(key: string): string {
    return `devxcode.${key}`;
  }

  /**
   * Get a value from global state (default storage)
   */
  async getValue<T>(key: string): Promise<T | undefined> {
    return await this.globalState.get<T>(this.getKey(key));
  }

  /**
   * Set a value in global state (default storage)
   */
  async setValue<T>(key: string, value: T): Promise<void> {
    await this.globalState.update(this.getKey(key), value);
  }

  /**
   * Delete a key from global state (default storage)
   */
  async deleteValue(key: string): Promise<void> {
    await this.globalState.update(this.getKey(key), undefined);
  }

  /**
   * Get a value from workspace state
   */
  async getWorkspaceValue<T>(key: string): Promise<T | undefined> {
    return this.workspaceState.get<T>(this.getKey(key));
  }

  /**
   * Set a value in workspace state
   */
  async setWorkspaceValue<T>(key: string, value: T): Promise<void> {
    await this.workspaceState.update(this.getKey(key), value);
  }

  /**
   * Get a value from global state
   */
  async getGlobalValue<T>(key: string): Promise<T | undefined> {
    return this.globalState.get<T>(this.getKey(key));
  }

  /**
   * Set a value in global state
   */
  async setGlobalValue<T>(key: string, value: T): Promise<void> {
    await this.globalState.update(this.getKey(key), value);
  }

  /**
   * Delete a key from workspace state
   */
  async deleteWorkspaceValue(key: string): Promise<void> {
    await this.workspaceState.update(this.getKey(key), undefined);
  }

  /**
   * Delete a key from global state
   */
  async deleteGlobalValue(key: string): Promise<void> {
    await this.globalState.update(this.getKey(key), undefined);
  }
}
