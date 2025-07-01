import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { LoginDto } from '../dto/auth.dto';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'user',
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.validateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockJwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };
      const mockToken = 'jwt-token';

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
