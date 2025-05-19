import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from '../services/todo.service';
import { Todo } from '../entities/todo.entity';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { LoggerService } from '../../common/logger/logger.service';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  const mockTodoService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockLoggerService = {
    setContext: jest.fn().mockReturnThis(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('コントローラーが正しく初期化されること', () => {
    expect(controller).toBeDefined();
  });

  it('コントローラーのルートパスが正しく設定されていること', () => {
    const controllerMetadata = Reflect.getMetadata(
      'path',
      TodoController,
    );
    expect(controllerMetadata).toBe('todos');
    expect(controllerMetadata).not.toBe('api/todos');
  });

  describe('findAll', () => {
    it('全てのタスクを取得できること', async () => {
      const result: Todo[] = [
        new Todo({ id: 1, task: 'Test task', completed: false, createdAt: new Date() }),
      ];
      mockTodoService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockTodoService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('指定したIDのタスクを取得できること', async () => {
      const result = new Todo({ id: 1, task: 'Test task', completed: false, createdAt: new Date() });
      mockTodoService.findById.mockResolvedValue(result);

      expect(await controller.findById('1')).toBe(result);
      expect(mockTodoService.findById).toHaveBeenCalledWith(1);
    });

    it('存在しないIDを指定した場合に404エラーが返されること', async () => {
      mockTodoService.findById.mockResolvedValue(null);

      try {
        await controller.findById('1');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('create', () => {
    it('新しいタスクを作成できること', async () => {
      const createTodoDto: CreateTodoDto = { task: 'New task' };
      const result = new Todo({ id: 1, ...createTodoDto, completed: false, createdAt: new Date() });
      mockTodoService.create.mockResolvedValue(result);

      expect(await controller.create(createTodoDto)).toBe(result);
      expect(mockTodoService.create).toHaveBeenCalledWith(createTodoDto);
    });
  });

  describe('update', () => {
    it('既存のタスクを更新できること', async () => {
      const updateTodoDto: UpdateTodoDto = { task: 'Updated task', completed: true };
      const result = new Todo({
        id: 1,
        task: 'Updated task',
        completed: true,
        createdAt: new Date(),
      });
      mockTodoService.update.mockResolvedValue(result);

      expect(await controller.update('1', updateTodoDto)).toBe(result);
      expect(mockTodoService.update).toHaveBeenCalledWith(1, updateTodoDto);
    });

    it('存在しないIDのタスクを更新しようとした場合に404エラーが返されること', async () => {
      const updateTodoDto: UpdateTodoDto = { task: 'Updated task' };
      mockTodoService.update.mockResolvedValue(null);

      try {
        await controller.update('1', updateTodoDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('delete', () => {
    it('タスクを削除できること', async () => {
      mockTodoService.delete.mockResolvedValue(true);

      expect(await controller.delete('1')).toEqual({ success: true });
      expect(mockTodoService.delete).toHaveBeenCalledWith(1);
    });

    it('存在しないIDのタスクを削除しようとした場合に404エラーが返されること', async () => {
      mockTodoService.delete.mockResolvedValue(false);

      try {
        await controller.delete('1');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
}); 