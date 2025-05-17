import { Module } from '@nestjs/common';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';
import { TodoRepository } from './repositories/todo.repository';
import { LoggerService } from '../common/logger/logger.service';

@Module({
  controllers: [TodoController],
  providers: [TodoService, TodoRepository, LoggerService],
  exports: [TodoService],
})
export class TodoModule {} 