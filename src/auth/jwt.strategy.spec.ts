import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when payload is valid', () => {
      const payload = {
        sub: '1',
        email: 'test@example.com',
        role: 'user',
      };

      const expectedUser = {
        id: '1',
        email: 'test@example.com',
        role: 'user',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual(expectedUser);
    });

    it('should handle different user roles', () => {
      const payload = {
        sub: '2',
        email: 'admin@example.com',
        role: 'admin',
      };

      const expectedUser = {
        id: '2',
        email: 'admin@example.com',
        role: 'admin',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual(expectedUser);
    });
  });
});
