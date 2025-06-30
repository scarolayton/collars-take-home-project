import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  AssignTaskDto,
} from '../dto/task.dto';

describe('TasksController', () => {
  let controller: TasksController;

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
  };

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    assignTask: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'user',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        dueDate: '2024-01-15T00:00:00.000Z',
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, mockRequest as any);

      expect(mockTasksService.create).toHaveBeenCalledWith(
        createTaskDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return tasks with pagination', async () => {
      const query: TaskQueryDto = {
        page: 1,
        limit: 10,
        status: 'pending',
      };

      const expectedResult = {
        tasks: [mockTask],
        total: 1,
      };

      mockTasksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(mockTasksService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const taskId = '1';
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });

    it('should handle NotFoundException when task not found', async () => {
      const taskId = '999';
      mockTasksService.findOne.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(controller.findOne(taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: 'in_progress',
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(taskId, updateTaskDto);

      expect(mockTasksService.update).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = '1';
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove(taskId);

      expect(mockTasksService.remove).toHaveBeenCalledWith(taskId);
    });
  });

  describe('assignTask', () => {
    it('should assign a task to a user', async () => {
      const taskId = '1';
      const assignTaskDto: AssignTaskDto = { userId: '2' };
      const assignedTask = { ...mockTask, assignedToId: '2' };

      mockTasksService.assignTask.mockResolvedValue(assignedTask);

      const result = await controller.assignTask(taskId, assignTaskDto);

      expect(mockTasksService.assignTask).toHaveBeenCalledWith(
        taskId,
        assignTaskDto,
      );
      expect(result).toEqual(assignedTask);
    });
  });
});
