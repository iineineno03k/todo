import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class TodoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(): Promise<Todo[]> {
    const todos = await this.prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return todos.map((todo: any) => new Todo(todo));
  }

  async findById(id: number): Promise<Todo | null> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });
    return todo ? new Todo(todo) : null;
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data: createTodoDto,
    });
    return new Todo(todo);
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo | null> {
    try {
      const todo = await this.prisma.todo.update({
        where: { id },
        data: updateTodoDto,
      });
      return new Todo(todo);
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.todo.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
} 