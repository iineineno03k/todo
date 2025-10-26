import { z } from 'zod';

// Zod schemas for runtime validation
export const todoSchema = z.object({
  id: z.number(),
  task: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
});

export const createTodoSchema = z.object({
  task: z.string().min(1, 'Task cannot be empty'),
});

export const updateTodoSchema = z.object({
  task: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

// TypeScript types
export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoDto = z.infer<typeof createTodoSchema>;
export type UpdateTodoDto = z.infer<typeof updateTodoSchema>;
