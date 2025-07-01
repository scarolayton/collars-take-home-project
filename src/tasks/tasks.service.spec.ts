import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  AssignTaskDto,
} from '../dto/task.dto';

describe('TasksService', () => {
  let service: TasksService;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  };

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(),
    assignedToId: null,
    createdById: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedTo: null,
    createdBy: mockUser,
  };

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task successfully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        dueDate: '2024-01-15T00:00:00.000Z',
      };
      const createdById = '1';

      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, createdById);

      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: 'pending',
        priority: createTaskDto.priority,
        assignedToId: undefined,
        createdById,
        dueDate: new Date(createTaskDto.dueDate!),
      });
      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should create task without due date', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
      };
      const createdById = '1';

      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, createdById);

      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: 'pending',
        priority: createTaskDto.priority,
        assignedToId: undefined,
        createdById,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return tasks with pagination and filtering', async () => {
      const query: TaskQueryDto = {
        page: 1,
        limit: 10,
        status: 'pending',
        priority: 'high',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
      };

      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(query);

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'task.assignedTo',
        'assignedTo',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'task.createdBy',
        'createdBy',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: 'pending' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.priority = :priority',
        { priority: 'high' },
      );
      expect(result).toEqual({ tasks: [mockTask], total: 1 });
    });
  });

  describe('findOne', () => {
    it('should return task when found', async () => {
      const taskId = '1';

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignedTo', 'createdBy'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = '999';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update task successfully', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: 'in_progress',
        dueDate: '2024-01-20T00:00:00.000Z',
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue({
        ...mockTask,
        ...updateTaskDto,
        dueDate: new Date(updateTaskDto.dueDate!),
      });

      const result = await service.update(taskId, updateTaskDto);

      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockTask,
        ...updateTaskDto,
        dueDate: new Date(updateTaskDto.dueDate!),
      });
    });
  });

  describe('remove', () => {
    it('should remove task successfully', async () => {
      const taskId = '1';

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.remove.mockResolvedValue(mockTask);

      await service.remove(taskId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignedTo', 'createdBy'],
      });
      expect(mockTaskRepository.remove).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('assignTask', () => {
    it('should assign task to user successfully', async () => {
      const taskId = '1';
      const assignTaskDto: AssignTaskDto = { userId: '2' };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskRepository.save.mockResolvedValue({
        ...mockTask,
        assignedToId: assignTaskDto.userId,
      });

      const result = await service.assignTask(taskId, assignTaskDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: assignTaskDto.userId },
      });
      expect(mockTaskRepository.save).toHaveBeenCalledWith({
        ...mockTask,
        assignedToId: assignTaskDto.userId,
      });
      expect(result.assignedToId).toBe(assignTaskDto.userId);
    });

    it('should throw NotFoundException when user not found', async () => {
      const taskId = '1';
      const assignTaskDto: AssignTaskDto = { userId: '999' };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.assignTask(taskId, assignTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserTasks', () => {
    it('should return tasks assigned to user', async () => {
      const userId = '1';
      const userTasks = [mockTask];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskRepository.find.mockResolvedValue(userTasks);

      const result = await service.getUserTasks(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockTaskRepository.find).toHaveBeenCalledWith({
        where: { assignedToId: userId },
        relations: ['assignedTo', 'createdBy'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(userTasks);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '999';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserTasks(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
