'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { todoApi } from '@/lib/api';
import { TodoItem } from './TodoItem';
import { AddTodoForm } from './AddTodoForm';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'active' | 'completed';

export function TodoList() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: todos, error, isLoading, mutate } = useSWR(
    'todos',
    todoApi.getAll,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const filteredTodos = todos?.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  }) ?? [];

  const activeTodoCount = todos?.filter((todo) => !todo.completed).length ?? 0;
  const completedTodoCount = todos?.filter((todo) => todo.completed).length ?? 0;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <h3 className="font-semibold mb-1">Error loading todos</h3>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={() => mutate()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">My Todos</h1>
        <p className="text-gray-600">
          {activeTodoCount} active, {completedTodoCount} completed
        </p>
      </div>

      {/* Add todo form */}
      <AddTodoForm mutate={mutate} />

      {/* Filter buttons */}
      {todos && todos.length > 0 && (
        <div className="flex justify-center gap-2">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                filter === filterType
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              )}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Todo list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all'
              ? 'No todos yet'
              : filter === 'active'
              ? 'No active todos'
              : 'No completed todos'}
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Add your first todo to get started!'
              : filter === 'active'
              ? 'All caught up! 🎉'
              : 'Complete some todos to see them here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} mutate={mutate} />
          ))}
        </div>
      )}
    </div>
  );
}
