import {
  Todo,
  todoSchema,
  CreateTodoDto,
  UpdateTodoDto,
} from '@/types/todo';

// Use relative path for Ingress routing
// In Kubernetes: /api routes to backend-service via Ingress
// In local dev: use NEXT_PUBLIC_API_URL or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `API request failed: ${response.statusText}`
      );
    }

    // Handle DELETE requests that might return non-JSON
    if (options?.method === 'DELETE') {
      return (await response.json()) as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const todoApi = {
  // Get all todos
  async getAll(): Promise<Todo[]> {
    const data = await fetchApi<unknown[]>('/todos');
    return data.map(item => todoSchema.parse(item));
  },

  // Get a single todo by ID
  async getById(id: number): Promise<Todo> {
    const data = await fetchApi<unknown>(`/todos/${id}`);
    return todoSchema.parse(data);
  },

  // Create a new todo
  async create(dto: CreateTodoDto): Promise<Todo> {
    const data = await fetchApi<unknown>('/todos', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return todoSchema.parse(data);
  },

  // Update a todo
  async update(id: number, dto: UpdateTodoDto): Promise<Todo> {
    const data = await fetchApi<unknown>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return todoSchema.parse(data);
  },

  // Delete a todo
  async delete(id: number): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>(`/todos/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle todo completion status
  async toggle(id: number, completed: boolean): Promise<Todo> {
    return this.update(id, { completed });
  },
};
