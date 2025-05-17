export class Todo {
  id: number;
  task: string;
  completed: boolean;
  createdAt: Date;

  constructor(partial: Partial<Todo>) {
    Object.assign(this, partial);
  }
} 