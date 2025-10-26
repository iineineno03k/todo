'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { todoApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Todo } from '@/types/todo';
import type { KeyedMutator } from 'swr';

interface TodoItemProps {
  todo: Todo;
  mutate: KeyedMutator<Todo[]>;
}

export function TodoItem({ todo, mutate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(todo.task);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await todoApi.update(todo.id, {
          task: todo.task,
          completed: !todo.completed
        });
        mutate();
      } catch (error) {
        console.error('Failed to toggle todo:', error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await todoApi.delete(todo.id);
        mutate();
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    });
  };

  const handleEdit = () => {
    if (isEditing && editedTask.trim() && editedTask !== todo.task) {
      startTransition(async () => {
        try {
          await todoApi.update(todo.id, {
            task: editedTask.trim(),
            completed: todo.completed
          });
          mutate();
          setIsEditing(false);
        } catch (error) {
          console.error('Failed to update todo:', error);
          setEditedTask(todo.task);
        }
      });
    } else if (isEditing) {
      setEditedTask(todo.task);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditedTask(todo.task);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-4 rounded-lg border',
        'transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        todo.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          todo.completed
            ? 'bg-blue-600 border-blue-600'
            : 'border-gray-300 hover:border-blue-500'
        )}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed && (
          <svg
            className="w-full h-full text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleEdit}
            disabled={isPending}
            className={cn(
              'w-full px-2 py-1 rounded border border-blue-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50'
            )}
            autoFocus
          />
        ) : (
          <div>
            <p
              className={cn(
                'text-base font-medium transition-all duration-200',
                todo.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              )}
            >
              {todo.task}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(todo.createdAt), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleEdit}
          disabled={isPending}
          className={cn(
            'p-2 text-gray-600 hover:text-blue-600',
            'rounded-lg hover:bg-blue-50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Edit todo"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className={cn(
            'p-2 text-gray-600 hover:text-red-600',
            'rounded-lg hover:bg-red-50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-red-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Delete todo"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
