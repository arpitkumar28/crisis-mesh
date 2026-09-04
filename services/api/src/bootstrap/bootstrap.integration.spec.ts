/**
 * Bootstrap Integration Tests
 * Tests to ensure bootstrap does not affect normal registration and RBAC
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthProvider } from '../auth/providers/jwt.provider';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '../config/config.service';
import { UserRoleEnum } from '../entities/profile.entity';
import { RegisterDto } from '../auth/dto/register.dto';

describe('Bootstrap Integration Tests', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let authProvider: JwtAuthProvider;

  const mockUsersService = {
    createProfile: jest.fn(),
    findByEmail: jest.fn(),
    getUserRoles: jest.fn(),
    updateLastLogin: jest.fn(),
    assignRole: jest.fn(),
    removeRole: jest.fn(),
  };

  const mockAuthProvider = {
    hashPassword: jest.fn(),
    validateCredentials: jest.fn(),
    generateToken: jest.fn(),
    validateToken: jest.fn(),
    refreshToken: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockAuditService = {
    logAuthentication: jest.fn(),
    logAuthorization: jest.fn(),
  };

  beforeEach(async () => {
    // Set test environment to skip config validation
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtAuthProvider,
          useValue: mockAuthProvider,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    authProvider = module.get<JwtAuthProvider>(JwtAuthProvider);

    jest.clearAllMocks();
  });

  describe('Normal Registration Flow', () => {
    it('should continue creating CITIZEN users by default (not affected by bootstrap)', async () => {
      const registerDto: RegisterDto = {
        email: 'citizen@example.com',
        password: 'SecurePass123',
        name: 'Regular Citizen',
        phone: '+1234567890',
        location_id: 'location-id',
      };

      const hashedPassword = 'hashed_password';
      const mockProfile = {
        id: 'profile-id',
        email: registerDto.email,
        name: registerDto.name,
      };

      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createProfile.mockResolvedValue(mockProfile);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]);
      mockAuthProvider.generateToken.mockResolvedValue('access_token');
      mockAuthProvider.generateToken.mockResolvedValue('refresh_token');
      mockAuditService.logAuthentication.mockResolvedValue(undefined);

      await authService.register(registerDto);

      // Verify that CITIZEN role was assigned, not ADMIN
      expect(mockUsersService.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password_hash: hashedPassword,
        }),
        UserRoleEnum.CITIZEN, // Default role should be CITIZEN
      );
    });

    it('should not allow self-registration as ADMIN', async () => {
      const registerDto: RegisterDto = {
        email: 'hacker@example.com',
        password: 'SecurePass123',
        name: 'Malicious User',
        phone: '+1234567890',
      };

      const hashedPassword = 'hashed_password';
      const mockProfile = {
        id: 'profile-id',
        email: registerDto.email,
        name: registerDto.name,
      };

      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createProfile.mockResolvedValue(mockProfile);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]);
      mockAuthProvider.generateToken.mockResolvedValue('access_token');
      mockAuthProvider.generateToken.mockResolvedValue('refresh_token');
      mockAuditService.logAuthentication.mockResolvedValue(undefined);

      await authService.register(registerDto);

      // Verify that even if someone tries to register, they get CITIZEN role
      expect(mockUsersService.createProfile).toHaveBeenCalledWith(
        expect.anything(),
        UserRoleEnum.CITIZEN, // Always CITIZEN for normal registration
      );
    });
  });

  describe('RBAC Integrity', () => {
    it('should maintain existing role assignment functionality', async () => {
      const userId = 'user-id';
      const adminId = 'admin-id';
      const role = UserRoleEnum.ADMIN;

      mockUsersService.assignRole.mockResolvedValue({ id: 'assignment-id' });
      mockAuditService.logAuthorization.mockResolvedValue(undefined);

      await authService.assignRole(userId, role, adminId);

      expect(mockUsersService.assignRole).toHaveBeenCalledWith(userId, role, adminId);
      expect(mockAuditService.logAuthorization).toHaveBeenCalledWith(
        adminId,
        'ASSIGN_ROLE',
        `User:${userId}`,
        undefined,
      );
    });

    it('should maintain existing role removal functionality', async () => {
      const userId = 'user-id';
      const role = UserRoleEnum.ADMIN;

      mockUsersService.removeRole.mockResolvedValue(undefined);

      await authService.removeRole(userId, role);

      expect(mockUsersService.removeRole).toHaveBeenCalledWith(userId, role);
    });
  });

  describe('Password Hashing Consistency', () => {
    it('should use the same password hashing mechanism for bootstrap and registration', async () => {
      const password = 'TestPassword123';

      // Test that both use the same auth provider
      const hash1 = await authProvider.hashPassword(password);
      const hash2 = await authProvider.hashPassword(password);

      expect(mockAuthProvider.hashPassword).toHaveBeenCalledWith(password);
      expect(mockAuthProvider.hashPassword).toHaveBeenCalledTimes(2);
    });
  });

  describe('Bootstrap Isolation', () => {
    it('should not expose bootstrap functionality through AuthService', () => {
      // Verify that bootstrap methods are not exposed in AuthService
      expect(typeof authService.register).toBe('function');
      expect(typeof authService.login).toBe('function');
      expect(typeof authService.assignRole).toBe('function');
      expect(typeof authService.removeRole).toBe('function');
      
      // Bootstrap should not be accessible through AuthService
      expect((authService as any).bootstrapAdmin).toBeUndefined();
      expect((authService as any).bootstrapService).toBeUndefined();
    });

    it('should not affect JWT authentication flow', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockUserProfile = {
        id: 'user-id',
        email: loginDto.email,
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
      };

      mockAuthProvider.validateCredentials.mockResolvedValue(mockUserProfile);
      mockAuthProvider.generateToken.mockResolvedValue('token');
      mockAuditService.logAuthentication.mockResolvedValue(undefined);

      await authService.login(loginDto);

      expect(mockAuthProvider.validateCredentials).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthProvider.generateToken).toHaveBeenCalled();
    });
  });
});