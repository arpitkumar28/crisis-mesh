import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRoleEnum } from '../entities/profile.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    assignRole: jest.fn(),
    removeRole: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockResult = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          roles: [UserRoleEnum.CITIZEN],
        },
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const result = await controller.register(registerDto, { ip: '127.0.0.1', userAgent: 'test-agent' });

      expect(result).toEqual({
        success: true,
        message: 'Registration successful',
        data: mockResult,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto,
        '127.0.0.1',
        'test-agent',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          roles: [UserRoleEnum.CITIZEN],
        },
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto, { ip: '127.0.0.1', userAgent: 'test-agent' });

      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        data: mockResult,
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        'test-agent',
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto = {
        refresh_token: 'old_refresh_token',
      };

      const mockResult = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          roles: [UserRoleEnum.CITIZEN],
        },
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResult);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual({
        success: true,
        message: 'Token refreshed successfully',
        data: mockResult,
      });
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old_refresh_token');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
      };

      const result = await controller.getCurrentUser(mockUser);

      expect(result).toEqual({
        success: true,
        message: 'User retrieved successfully',
        data: mockUser,
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      const result = await controller.logout(mockUser, { ip: '127.0.0.1', userAgent: 'test-agent' });

      expect(result).toEqual({
        success: true,
        message: 'Logout successful',
      });
    });
  });

  describe('assignRole', () => {
    it('should assign role successfully', async () => {
      const mockUser = {
        id: 'admin-id',
        email: 'admin@example.com',
      };

      const body = {
        userId: 'user-id',
        role: UserRoleEnum.ADMIN,
      };

      mockAuthService.assignRole.mockResolvedValue(undefined);

      const result = await controller.assignRole(mockUser, body, { ip: '127.0.0.1', userAgent: 'test-agent' });

      expect(result).toEqual({
        success: true,
        message: 'Role assigned successfully',
      });
      expect(mockAuthService.assignRole).toHaveBeenCalledWith('user-id', UserRoleEnum.ADMIN, 'admin-id');
    });
  });

  describe('removeRole', () => {
    it('should remove role successfully', async () => {
      const mockUser = {
        id: 'admin-id',
        email: 'admin@example.com',
      };

      const body = {
        userId: 'user-id',
        role: UserRoleEnum.ADMIN,
      };

      mockAuthService.removeRole.mockResolvedValue(undefined);

      const result = await controller.removeRole(mockUser, body);

      expect(result).toEqual({
        success: true,
        message: 'Role removed successfully',
      });
      expect(mockAuthService.removeRole).toHaveBeenCalledWith('user-id', UserRoleEnum.ADMIN);
    });
  });
});
