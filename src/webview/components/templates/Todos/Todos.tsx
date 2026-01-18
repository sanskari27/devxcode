import { RadioButton, Section } from '@components/atoms';
import { Alert } from '@components/molecules';
import { Todo } from '@services/todos';
import { showNotification } from '@src/webview/utils/notifications';
import { Plus } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTodosService } from '../../../hooks/useTodosService';

export const Todos: React.FC = () => {
  const { todos, createTodo, updateTodo } = useTodosService();

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
      showNotification('Failed to update todo ' + error, 'error');
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
      contentClassName="mx-2"
    >
      {sortedNotCompletedTodos.map(todo => (
        <RadioButton
          key={todo.id}
          label={todo.message}
          checked={false}
          onClick={() => handleToggleCompleted(todo.id)}
        />
      ))}
      <Section title="Completed" contentClassName="mx-2">
        {sortedCompletedTodos.map(todo => (
          <RadioButton
            key={todo.id}
            label={todo.message}
            checked={true}
            onClick={() => handleToggleCompleted(todo.id)}
            className={'line-through'}
          />
        ))}
      </Section>
    </Section>
  );
};
