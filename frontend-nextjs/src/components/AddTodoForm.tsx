'use client';

import { useState, useTransition } from 'react';
import { todoApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { KeyedMutator } from 'swr';
import type { Todo } from '@/types/todo';

interface AddTodoFormProps {
  onSuccess?: () => void;
  mutate: KeyedMutator<Todo[]>;
}

export function AddTodoForm({ onSuccess, mutate }: AddTodoFormProps) {
  const [task, setTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!task.trim()) {
      setError('Task cannot be empty');
      return;
    }

    startTransition(async () => {
      try {
        await todoApi.create({ task: task.trim() });
        setTask('');
        mutate(); // Revalidate the todo list
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create todo');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What needs to be done?"
          disabled={isPending}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg border border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'text-base'
          )}
          aria-label="New todo task"
        />
        <button
          type="submit"
          disabled={isPending || !task.trim()}
          className={cn(
            'px-6 py-3 bg-blue-600 text-white rounded-lg font-medium',
            'hover:bg-blue-700 active:bg-blue-800',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'shadow-sm hover:shadow-md'
          )}
        >
          {isPending ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm font-medium" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
