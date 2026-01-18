import { STORAGE_KEYS } from '../lib/constants';
import { StorageService } from './storage';

/**
 * Todo interface
 * Represents a single todo item with message and completion status
 */
export interface Todo {
  id: string;
  message: string;
  completed: boolean;
  createdAt: string;
}

/**
 * Todos service for managing todos
 * Provides CRUD operations
 */
export class TodosService {
  private readonly STORAGE_KEY = STORAGE_KEYS.TODOS;

  constructor(private storage: StorageService) {}

  /**
   * Generate a unique ID using timestamp and random string
   */
  private _generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return `${timestamp}-${randomStr}`;
  }

  /**
   * Get all todos from storage
   */
  private async _getAllTodosData(): Promise<Todo[]> {
    const todos = await this.storage.getValue<Todo[]>(this.STORAGE_KEY);
    return todos ?? [];
  }

  /**
   * Save all todos to storage
   */
  private async _saveAllTodosData(todos: Todo[]): Promise<void> {
    await this.storage.setValue(this.STORAGE_KEY, todos);
  }

  /**
   * Get all todos
   */
  async getAllTodos(): Promise<Todo[]> {
    return this._getAllTodosData();
  }

  /**
   * Get a todo by ID
   */
  async getTodoById(id: string): Promise<Todo | undefined> {
    const todos = await this._getAllTodosData();
    return todos.find(todo => todo.id === id);
  }

  /**
   * Create a new todo
   */
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> {
    const todos = await this._getAllTodosData();
    const newTodo: Todo = {
      ...todo,
      id: this._generateId(),
      createdAt: new Date().toISOString(),
    };
    todos.push(newTodo);
    await this._saveAllTodosData(todos);
    return newTodo;
  }

  /**
   * Update an existing todo
   */
  async updateTodo(
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
  ): Promise<Todo> {
    const todos = await this._getAllTodosData();
    const index = todos.findIndex(todo => todo.id === id);

    if (index === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }

    todos[index] = {
      ...todos[index],
      ...updates,
      id: todos[index].id, // Ensure ID is not overwritten
      createdAt: todos[index].createdAt, // Ensure createdAt is not overwritten
    };

    await this._saveAllTodosData(todos);
    return todos[index];
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<void> {
    const todos = await this._getAllTodosData();
    const filteredTodos = todos.filter(todo => todo.id !== id);

    if (filteredTodos.length === todos.length) {
      throw new Error(`Todo with id ${id} not found`);
    }

    await this._saveAllTodosData(filteredTodos);
  }
}
