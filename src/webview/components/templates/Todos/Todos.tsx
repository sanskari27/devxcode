import { RadioButton, Section } from '@components/atoms';
import { Alert } from '@components/molecules';
import { cn } from '@lib/utils';
import { showNotification } from '@src/webview/utils/notifications';
import { Plus } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTodosService } from '../../../hooks/useTodosService';

export const Todos: React.FC = () => {
    const { todos, createTodo, updateTodo, deleteTodo } = useTodosService();

    const handleAddTodo = () => {
        Alert.title('Add New Todo')
            .description('Enter todo message')
            .addInput('Enter todo message', 'message')
            .addButton('primary', 'Add', async (values) => {
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
            const todo = todos.find((t) => t.id === todoId);
            if (!todo) return;
            await updateTodo(todoId, {
                completed: !todo.completed,
            });
        } catch (error: any) {
            console.error('Failed to update todo:', error);
            showNotification('Failed to update todo ' + error, 'error');
        }
    };
    // Sort todos: first by completion status (non-completed first), then by createdAt descending (newest first)
    const sortedTodos = useMemo(() => {
        return [...todos].sort((a, b) => {
            // First level: non-completed todos come first
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // Second level: descending order by time (newest first)
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [todos]);

    return (
        <Section
            title='Todos'
            action={handleAddTodo}
            actionIcon={Plus}
            defaultExpanded
        >
            {sortedTodos.map((todo) => (
                <div className='px-2 py-1' role='button' tabIndex={0}>
                    <RadioButton
                        label={todo.message}
                        checked={todo.completed}
                        onClick={() => handleToggleCompleted(todo.id)}
                        className={cn(todo.completed ? 'line-through' : '')}
                    />
                </div>
            ))}
        </Section>
    );
};
