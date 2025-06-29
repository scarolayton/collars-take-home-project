import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

describe('UsersService', () => {
  let service: UsersService;

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
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#create', () => {
    it('should create a new user successfully', async () => {
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

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when user with email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
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

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const userId = '1';
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '999';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // for findOne
        .mockResolvedValueOnce(null); // for email check
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.update(userId, updateUserDto);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
    });

    it('should throw ConflictException when updating to existing email', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // for findOne
        .mockResolvedValueOnce({ id: '2', email: 'existing@example.com' }); // for email check

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password when updating password', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // for findOne
        .mockResolvedValueOnce(null); // for email check
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.update(userId, updateUserDto);

      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const userId = '1';
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      await service.remove(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });

      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findUserTasks', () => {
    it('should return user with assigned tasks', async () => {
      const userId = '1';
      const userWithTasks = {
        ...mockUser,
        assignedTasks: [
          {
            id: '1',
            title: 'Task 1',
            description: 'Description 1',
            status: 'pending',
            priority: 'high',
          },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(userWithTasks);

      const result = await service.findUserTasks(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['assignedTasks'],
      });
      expect(result).toEqual(userWithTasks);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '999';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserTasks(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
