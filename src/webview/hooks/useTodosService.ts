import { STORAGE_KEYS } from '@lib/constants';
import type { Todo } from '@services/todos';
import { TodosService } from '@services/todos';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebviewStorageAdapter } from '../services/WebviewStorageAdapter';

/**
 * Hook to manage todos using TodosService
 * Uses WebviewStorageAdapter to bridge webview postMessage with the service
 */
export function useTodosService() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create adapter and service instances (memoized to avoid recreating)
  const { adapter, service } = useMemo(() => {
    const storageAdapter = new WebviewStorageAdapter();
    const todosService = new TodosService(storageAdapter as any);
    return {
      adapter: storageAdapter,
      service: todosService,
    };
  }, []);

  // Load initial todos
  useEffect(() => {
    let isMounted = true;

    const loadTodos = async () => {
      try {
        setIsLoading(true);
        const allTodos = await service.getAllTodos();
        if (isMounted) {
          setTodos(allTodos);
        }
      } catch (error) {
        console.error('Failed to load todos:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTodos();

    // Listen for storage updates from extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'storageUpdated' && message.key === STORAGE_KEYS.TODOS) {
        // Reload todos when storage is updated
        loadTodos();
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

  const getAllTodos = useCallback(async (): Promise<Todo[]> => {
    const allTodos = await service.getAllTodos();
    setTodos(allTodos);
    return allTodos;
  }, [service]);

  const createTodo = useCallback(
    async (todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> => {
      const newTodo = await service.createTodo(todo);
      // Refresh todos from service
      const allTodos = await service.getAllTodos();
      setTodos(allTodos);
      return newTodo;
    },
    [service]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo> => {
      const updatedTodo = await service.updateTodo(id, updates);
      // Refresh todos from service
      const allTodos = await service.getAllTodos();
      setTodos(allTodos);
      return updatedTodo;
    },
    [service]
  );

  const deleteTodo = useCallback(
    async (id: string): Promise<void> => {
      await service.deleteTodo(id);
      // Refresh todos from service
      const allTodos = await service.getAllTodos();
      setTodos(allTodos);
    },
    [service]
  );

  return {
    todos,
    isLoading,
    getAllTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
