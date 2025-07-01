import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    address: {
      addressLine1: '123 Main St',
      city: 'New York',
      stateOrProvince: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findUserTasks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
        phoneNumber: '+1234567890',
        address: {
          addressLine1: '456 Oak St',
          city: 'Los Angeles',
          stateOrProvince: 'CA',
          postalCode: '90210',
          country: 'USA',
        },
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle ConflictException when user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Existing User',
        email: 'existing@example.com',
        phoneNumber: '+1234567890',
        address: {
          addressLine1: '456 Oak St',
          city: 'Los Angeles',
          stateOrProvince: 'CA',
          postalCode: '90210',
          country: 'USA',
        },
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should handle NotFoundException when user not found', async () => {
      const userId = '999';
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserTasks', () => {
    it('should return user tasks', async () => {
      const userId = '1';
      const userWithTasks = {
        ...mockUser,
        assignedTasks: [{ id: '1', title: 'Task 1' }],
      };

      mockUsersService.findUserTasks.mockResolvedValue(userWithTasks);

      const result = await controller.findUserTasks(userId);

      expect(mockUsersService.findUserTasks).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userWithTasks);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '1';
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove(userId);

      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });
  });
});
