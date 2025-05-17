import { z } from 'zod';

export const createTodoSchema = z.object({
  task: z.string().min(1, 'タスクは必須です'),
});

export type CreateTodoDto = z.infer<typeof createTodoSchema>; 