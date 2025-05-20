import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { TodoService } from '../services/todo.service';
import { createTodoSchema, CreateTodoDto } from '../dtos/create-todo.dto';
import { updateTodoSchema, UpdateTodoDto } from '../dtos/update-todo.dto';
import { Todo } from '../entities/todo.entity';
import { LoggerService } from '../../common/logger/logger.service';

@Controller('todos')
export class TodoController {
  private readonly logger: LoggerService;

  constructor(
    private readonly todoService: TodoService,
    logger: LoggerService,
  ) {
    this.logger = logger.setContext('TodoController');
  }

  @Get()
  async findAll(): Promise<Todo[]> {
    this.logger.debug('Fetching all todos');
    return this.todoService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Todo> {
    this.logger.debug(`Fetching todo with id ${id}`);
    const todo = await this.todoService.findById(Number(id));
    if (!todo) {
      this.logger.warn(`Todo with id ${id} not found`);
      throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    }
    
    return todo;
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    try {
      this.logger.debug(`Creating new todo: ${JSON.stringify(createTodoDto)}`);
      // Zodによるバリデーション
      createTodoSchema.parse(createTodoDto);
      return this.todoService.create(createTodoDto);
    } catch (error) {
      this.logger.error(`Validation error creating todo: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Validation failed', errors: error.errors },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto): Promise<Todo> {
    try {
      this.logger.debug(`Updating todo ${id}: ${JSON.stringify(updateTodoDto)}`);
      // Zodによるバリデーション
      updateTodoSchema.parse(updateTodoDto);

      const todo = await this.todoService.update(Number(id), updateTodoDto);
      if (!todo) {
        this.logger.warn(`Todo with id ${id} not found for update`);
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
      return todo;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error updating todo ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Validation failed', errors: error.errors },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    this.logger.debug(`Deleting todo with id ${id}`);
    const deleted = await this.todoService.delete(Number(id));
    if (!deleted) {
      this.logger.warn(`Todo with id ${id} not found for deletion`);
      throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    }
    this.logger.log(`Successfully deleted todo with id ${id}`);
    return { success: true };
  }
} 