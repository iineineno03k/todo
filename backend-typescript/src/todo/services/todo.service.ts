import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../repositories/todo.repository';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async findAll(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }

  async findById(id: number): Promise<Todo | null> {
    return this.todoRepository.findById(id);
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoRepository.create(createTodoDto);
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo | null> {
    return this.todoRepository.update(id, updateTodoDto);
  }

  async delete(id: number): Promise<boolean> {
    return this.todoRepository.delete(id);
  }
} 