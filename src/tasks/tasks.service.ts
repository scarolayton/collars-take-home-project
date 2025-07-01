import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  AssignTaskDto,
} from '../dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    createdById: string,
  ): Promise<Task> {
    const taskData: Partial<Task> = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || 'pending',
      priority: createTaskDto.priority || 'medium',
      assignedToId: createTaskDto.assignedToId,
      createdById,
    };

    if (createTaskDto.dueDate) {
      taskData.dueDate = new Date(createTaskDto.dueDate);
    }

    const task = this.taskRepository.create(taskData);
    return this.taskRepository.save(task);
  }

  async findAll(
    query: TaskQueryDto,
  ): Promise<{ tasks: Task[]; total: number }> {
    const { page = 1, limit = 10, status, priority, assignedToId } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy');

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (assignedToId) {
      queryBuilder.andWhere('task.assignedToId = :assignedToId', {
        assignedToId,
      });
    }

    const [tasks, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('task.createdAt', 'DESC')
      .getManyAndCount();

    return { tasks, total };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Handle date conversion separately
    if (updateTaskDto.dueDate) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }

    // Assign other properties
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  async assignTask(id: string, assignTaskDto: AssignTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const user = await this.userRepository.findOne({
      where: { id: assignTaskDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${assignTaskDto.userId} not found`,
      );
    }

    task.assignedToId = assignTaskDto.userId;
    return this.taskRepository.save(task);
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.taskRepository.find({
      where: { assignedToId: userId },
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }
}
