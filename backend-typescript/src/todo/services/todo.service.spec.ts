import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { TodoRepository } from '../repositories/todo.repository';
import { Todo } from '../entities/todo.entity';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { LoggerService } from '../../common/logger/logger.service';

describe('TodoService', () => {
  let service: TodoService;
  let repository: TodoRepository;

  const mockTodoRepository = {
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
      providers: [
        TodoService,
        {
          provide: TodoRepository,
          useValue: mockTodoRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get<TodoRepository>(TodoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('サービスが正しく初期化されること', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('全てのタスクを取得できること', async () => {
      const result: Todo[] = [
        new Todo({ id: 1, task: 'Test task', completed: false, createdAt: new Date() }),
      ];
      mockTodoRepository.findAll.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(mockTodoRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('指定したIDのタスクを取得できること', async () => {
      const result = new Todo({ id: 1, task: 'Test task', completed: false, createdAt: new Date() });
      mockTodoRepository.findById.mockResolvedValue(result);

      expect(await service.findById(1)).toBe(result);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(1);
    });

    it('存在しないIDを指定した場合にnullが返されること', async () => {
      mockTodoRepository.findById.mockResolvedValue(null);

      expect(await service.findById(999)).toBeNull();
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('新しいタスクを作成できること', async () => {
      const createTodoDto: CreateTodoDto = { task: 'New task' };
      const result = new Todo({ id: 1, ...createTodoDto, completed: false, createdAt: new Date() });
      mockTodoRepository.create.mockResolvedValue(result);

      expect(await service.create(createTodoDto)).toBe(result);
      expect(mockTodoRepository.create).toHaveBeenCalledWith(createTodoDto);
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
      mockTodoRepository.update.mockResolvedValue(result);

      expect(await service.update(1, updateTodoDto)).toBe(result);
      expect(mockTodoRepository.update).toHaveBeenCalledWith(1, updateTodoDto);
    });

    it('存在しないIDのタスクを更新しようとした場合にnullが返されること', async () => {
      const updateTodoDto: UpdateTodoDto = { task: 'Updated task' };
      mockTodoRepository.update.mockResolvedValue(null);

      expect(await service.update(999, updateTodoDto)).toBeNull();
      expect(mockTodoRepository.update).toHaveBeenCalledWith(999, updateTodoDto);
    });
  });

  describe('delete', () => {
    it('タスクを削除できること', async () => {
      mockTodoRepository.delete.mockResolvedValue(true);

      expect(await service.delete(1)).toBe(true);
      expect(mockTodoRepository.delete).toHaveBeenCalledWith(1);
    });

    it('存在しないIDのタスクを削除しようとした場合にfalseが返されること', async () => {
      mockTodoRepository.delete.mockResolvedValue(false);

      expect(await service.delete(999)).toBe(false);
      expect(mockTodoRepository.delete).toHaveBeenCalledWith(999);
    });
  });
}); 