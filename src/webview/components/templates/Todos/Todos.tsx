import { RadioButton, Section } from '@components/atoms';
import { Alert } from '@components/molecules';
import { cn } from '@lib/utils';
import { Todo } from '@services/todos';
import { Eraser, Plus, Trash } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTodosService } from '../../../hooks/useTodosService';

export const Todos: React.FC = () => {
  const { todos, createTodo, updateTodo, deleteTodo } = useTodosService();

  const handleAddTodo = () => {
    Alert.title('Add New Todo')
      .description('Enter todo message')
      .addInput('Enter todo message', 'message')
      .addButton('primary', 'Add', async values => {
        if (values.message) {
          await createTodo({
            message: values.message,
            completed: false,
          });
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled adding todo');
      })
      .show();
  };

  const handleToggleCompleted = async (todoId: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      await updateTodo(todoId, {
        completed: !todo.completed,
      });
    } catch (error: any) {
      console.error('Failed to update todo:', error);
    }
  };

  const groupedTodos = useMemo(() => {
    return todos.reduce(
      (acc, todo) => {
        acc[todo.completed ? 'completed' : 'notCompleted'].push(todo);
        return acc;
      },
      { completed: [] as Todo[], notCompleted: [] as Todo[] }
    );
  }, [todos]);

  const sortedCompletedTodos = useMemo(() => {
    return groupedTodos.completed.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [groupedTodos]);

  const handleClearAllCompleted = () => {
    Alert.title('Clear All Completed Todos')
      .description(
        `Are you sure you want to delete all ${sortedCompletedTodos.length} completed todo(s)? This action cannot be undone.`
      )
      .addButton('primary', 'Clear All', async () => {
        try {
          // Delete all completed todos
          await Promise.all(
            sortedCompletedTodos.map(todo => deleteTodo(todo.id))
          );
        } catch (error: any) {
          console.error('Failed to clear completed todos:', error);
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled clearing completed todos');
      })
      .show();
  };

  const sortedNotCompletedTodos = useMemo(() => {
    return groupedTodos.notCompleted.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [groupedTodos]);

  return (
    <Section
      title="Todos"
      action={handleAddTodo}
      actionIcon={Plus}
      defaultExpanded
      contentClassName="ml-2"
    >
      {sortedNotCompletedTodos.map(todo => (
        <RadioButton
          key={todo.id}
          label={todo.message}
          checked={false}
          onClick={() => handleToggleCompleted(todo.id)}
        />
      ))}
      {sortedCompletedTodos.length > 0 && (
        <Section
          title="Completed"
          contentClassName="mx-2"
          action={handleClearAllCompleted}
          actionIcon={Eraser}
        >
          {sortedCompletedTodos.map(todo => (
            <div key={todo.id} className="flex items-center gap-2">
              <RadioButton
                label={todo.message}
                checked={true}
                onClick={() => handleToggleCompleted(todo.id)}
                className={'line-through'}
              />
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
                className={cn(
                  'p-1 rounded cursor-pointer ml-auto -mr-2',
                  'hover:bg-[var(--vscode-list-hoverBackground)]',
                  'transition-colors',
                  'flex items-center justify-center'
                )}
                tabIndex={0}
              >
                <Trash className="h-3.5 w-3.5 text-[var(--vscode-icon-foreground)]" />
              </button>
            </div>
          ))}
        </Section>
      )}
    </Section>
  );
};
