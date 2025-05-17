import { z } from 'zod';

export const updateTodoSchema = z.object({
  task: z.string().min(1, 'タスクは必須です').optional(),
  completed: z.boolean().optional(),
});

export type UpdateTodoDto = z.infer<typeof updateTodoSchema>; 