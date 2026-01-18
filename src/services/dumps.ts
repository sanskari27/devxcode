import { STORAGE_KEYS } from '../lib/constants';
import { generateId } from '../lib/utils';
import { StorageService } from './storage';

/**
 * Dump interface
 * Represents a single dump item with content
 */
export interface Dump {
  id: string;
  content: string;
}

/**
 * Dumps service for managing dumps
 * Provides CRUD operations
 */
export class DumpsService {
  private readonly STORAGE_KEY = STORAGE_KEYS.DUMPS;

  constructor(private storage: StorageService) {}

  /**
   * Get all dumps from storage
   */
  private async _getAllDumpsData(): Promise<Dump[]> {
    const dumps = await this.storage.getValue<Dump[]>(this.STORAGE_KEY);
    return dumps ?? [];
  }

  /**
   * Save all dumps to storage
   */
  private async _saveAllDumpsData(dumps: Dump[]): Promise<void> {
    await this.storage.setValue(this.STORAGE_KEY, dumps);
  }

  /**
   * Get all dumps
   */
  async getAllDumps(): Promise<Dump[]> {
    return this._getAllDumpsData();
  }

  /**
   * Get a dump by ID
   */
  async getDumpById(id: string): Promise<Dump | undefined> {
    const dumps = await this._getAllDumpsData();
    return dumps.find(dump => dump.id === id);
  }

  /**
   * Create a new dump
   */
  async createDump(dump: Omit<Dump, 'id'>): Promise<Dump> {
    const dumps = await this._getAllDumpsData();
    const newDump: Dump = {
      ...dump,
      id: generateId('dump'),
    };
    dumps.unshift(newDump);
    await this._saveAllDumpsData(dumps);
    return newDump;
  }

  /**
   * Update an existing dump
   */
  async updateDump(
    id: string,
    updates: Partial<Omit<Dump, 'id'>>
  ): Promise<Dump> {
    const dumps = await this._getAllDumpsData();
    const index = dumps.findIndex(dump => dump.id === id);

    if (index === -1) {
      throw new Error(`Dump with id ${id} not found`);
    }

    dumps[index] = {
      ...dumps[index],
      ...updates,
      id: dumps[index].id, // Ensure ID is not overwritten
    };

    await this._saveAllDumpsData(dumps);
    return dumps[index];
  }

  /**
   * Delete a dump
   */
  async deleteDump(id: string): Promise<void> {
    const dumps = await this._getAllDumpsData();
    const filteredDumps = dumps.filter(dump => dump.id !== id);

    if (filteredDumps.length === dumps.length) {
      throw new Error(`Dump with id ${id} not found`);
    }

    await this._saveAllDumpsData(filteredDumps);
  }
}
