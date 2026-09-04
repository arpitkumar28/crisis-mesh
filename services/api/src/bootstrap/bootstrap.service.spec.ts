import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapService } from './bootstrap.service';
import { ConfigService } from '../config/config.service';
import { UsersService } from '../users/users.service';
import { JwtAuthProvider } from '../auth/providers/jwt.provider';
import { UserRoleEnum } from '../entities/profile.entity';

describe('BootstrapService', () => {
  let service: BootstrapService;
  let configService: ConfigService;
  let usersService: UsersService;
  let authProvider: JwtAuthProvider;

  const mockConfigService = {
    get: jest.fn((key: string) => process.env[key]),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    createProfile: jest.fn(),
    getUserRoles: jest.fn(),
    assignRole: jest.fn(),
  };

  const mockAuthProvider = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    // Set test environment to skip config validation
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootstrapService,
        ConfigService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtAuthProvider,
          useValue: mockAuthProvider,
        },
      ],
    }).compile();

    service = module.get<BootstrapService>(BootstrapService);
    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
    authProvider = module.get<JwtAuthProvider>(JwtAuthProvider);

    jest.clearAllMocks();
    
    // Clear environment variables before each test
    delete process.env.BOOTSTRAP_ADMIN_EMAIL;
    delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bootstrapAdmin', () => {
    afterEach(() => {
      delete process.env.BOOTSTRAP_ADMIN_EMAIL;
      delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
    });

    it('should skip bootstrap when environment variables are not configured (opt-in)', async () => {
      await service.bootstrapAdmin();

      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
      expect(mockUsersService.createProfile).not.toHaveBeenCalled();
    });

    it('should skip bootstrap when only email is configured', async () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.com';

      await service.bootstrapAdmin();

      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
      expect(mockUsersService.createProfile).not.toHaveBeenCalled();
    });

    it('should skip bootstrap when only password is configured', async () => {
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'SecurePass123';

      await service.bootstrapAdmin();

      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
      expect(mockUsersService.createProfile).not.toHaveBeenCalled();
    });

    it('should fail with invalid email format', async () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'invalid-email';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'SecurePass123';

      await expect(service.bootstrapAdmin()).rejects.toThrow('Invalid BOOTSTRAP_ADMIN_EMAIL format');
    });

    it('should fail with weak password (too short)', async () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.com';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'Short1';

      await expect(service.bootstrapAdmin()).rejects.toThrow('BOOTSTRAP_ADMIN_PASSWORD does not meet security requirements');
    });

    it('should fail with weak password (no uppercase)', async () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.com';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'lowercase123';

      await expect(service.bootstrapAdmin()).rejects.toThrow('BOOTSTRAP_ADMIN_PASSWORD does not meet security requirements');
    });

    it('should fail with weak password (no lowercase)', async () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.com';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'UPPERCASE123';

      await expect(service.bootstrapAdmin()).rejects.toThrow('BOOTSTRAP_ADMIN_PASSWORD does not meet security requirements');
    });

    it('should fail with weak password (no number)', async () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.com';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'NoNumbers';

      await expect(service.bootstrapAdmin()).rejects.toThrow('BOOTSTRAP_ADMIN_PASSWORD does not meet security requirements');
    });

    it('should create new admin user when configured and user does not exist', async () => {
      const bootstrapEmail = 'admin@example.com';
      const bootstrapPassword = 'SecurePass123';
      const hashedPassword = 'hashed_password';
      const mockProfile = {
        id: 'profile-id',
        email: bootstrapEmail,
        name: 'Bootstrap Admin',
      };

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createProfile.mockResolvedValue(mockProfile);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.ADMIN]);

      await service.bootstrapAdmin();

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(bootstrapEmail);
      expect(mockAuthProvider.hashPassword).toHaveBeenCalledWith(bootstrapPassword);
      expect(mockUsersService.createProfile).toHaveBeenCalledWith(
        {
          email: bootstrapEmail,
          password_hash: hashedPassword,
          name: 'Bootstrap Admin',
          phone: undefined,
          location_id: undefined,
        },
        UserRoleEnum.ADMIN,
      );
      expect(mockUsersService.getUserRoles).toHaveBeenCalledWith(mockProfile.id);
    });

    it('should be idempotent - do nothing if admin already exists with ADMIN role', async () => {
      const bootstrapEmail = 'admin@example.com';
      const bootstrapPassword = 'SecurePass123';
      const existingProfile = {
        id: 'existing-profile-id',
        email: bootstrapEmail,
        name: 'Existing Admin',
      };

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockResolvedValue(existingProfile);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.ADMIN]);

      await service.bootstrapAdmin();

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(bootstrapEmail);
      expect(mockUsersService.getUserRoles).toHaveBeenCalledWith(existingProfile.id);
      expect(mockUsersService.createProfile).not.toHaveBeenCalled();
      expect(mockAuthProvider.hashPassword).not.toHaveBeenCalled();
    });

    it('should prevent privilege escalation - skip if user exists without ADMIN role', async () => {
      const bootstrapEmail = 'user@example.com';
      const bootstrapPassword = 'SecurePass123';
      const existingProfile = {
        id: 'existing-profile-id',
        email: bootstrapEmail,
        name: 'Regular User',
      };

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockResolvedValue(existingProfile);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]);

      await service.bootstrapAdmin();

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(bootstrapEmail);
      expect(mockUsersService.getUserRoles).toHaveBeenCalledWith(existingProfile.id);
      expect(mockUsersService.createProfile).not.toHaveBeenCalled();
      expect(mockUsersService.assignRole).not.toHaveBeenCalled();
    });

    it('should verify role assignment after creating admin', async () => {
      const bootstrapEmail = 'admin@example.com';
      const bootstrapPassword = 'SecurePass123';
      const hashedPassword = 'hashed_password';
      const mockProfile = {
        id: 'profile-id',
        email: bootstrapEmail,
        name: 'Bootstrap Admin',
      };

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createProfile.mockResolvedValue(mockProfile);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]); // Wrong role assigned

      await expect(service.bootstrapAdmin()).rejects.toThrow('Failed to assign ADMIN role during bootstrap');
    });

    it('should handle database errors gracefully', async () => {
      const bootstrapEmail = 'admin@example.com';
      const bootstrapPassword = 'SecurePass123';

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.bootstrapAdmin()).rejects.toThrow('Database connection failed');
    });

    it('should use existing password hashing mechanism', async () => {
      const bootstrapEmail = 'admin@example.com';
      const bootstrapPassword = 'SecurePass123';
      const hashedPassword = 'hashed_using_bcrypt';
      const mockProfile = {
        id: 'profile-id',
        email: bootstrapEmail,
        name: 'Bootstrap Admin',
      };

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createProfile.mockResolvedValue(mockProfile);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.ADMIN]);

      await service.bootstrapAdmin();

      expect(mockAuthProvider.hashPassword).toHaveBeenCalledWith(bootstrapPassword);
      expect(mockUsersService.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: hashedPassword,
        }),
        UserRoleEnum.ADMIN,
      );
    });
  });

  describe('isBootstrapConfigured', () => {
    afterEach(() => {
      delete process.env.BOOTSTRAP_ADMIN_EMAIL;
      delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
    });

    it('should return true when both email and password are configured', () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.com';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'SecurePass123';

      expect(service.isBootstrapConfigured()).toBe(true);
    });

    it('should return false when email is missing', () => {
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'SecurePass123';

      expect(service.isBootstrapConfigured()).toBe(false);
    });

    it('should return false when password is missing', () => {
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.com';

      expect(service.isBootstrapConfigured()).toBe(false);
    });

    it('should return false when both are missing', () => {
      expect(service.isBootstrapConfigured()).toBe(false);
    });
  });

  describe('security tests', () => {
    afterEach(() => {
      delete process.env.BOOTSTRAP_ADMIN_EMAIL;
      delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
    });

    it('should never log bootstrap password', async () => {
      const bootstrapEmail = 'admin@example.com';
      const bootstrapPassword = 'SecretPassword123';

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockAuthProvider.hashPassword.mockResolvedValue('hashed');
      mockUsersService.createProfile.mockResolvedValue({ id: 'id', email: bootstrapEmail });
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.ADMIN]);

      // Spy on logger to ensure password is never logged
      const loggerSpy = jest.spyOn((service as any).logger, 'log').mockImplementation();
      const loggerErrorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();

      await service.bootstrapAdmin();

      const allLogs = [...loggerSpy.mock.calls, ...loggerErrorSpy.mock.calls];
      const passwordLogged = allLogs.some((call) => 
        call.some((arg: any) => arg && typeof arg === 'string' && arg.includes(bootstrapPassword))
      );

      expect(passwordLogged).toBe(false);

      loggerSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it('should not return password in any response', async () => {
      const bootstrapEmail = 'admin@example.com';
      const bootstrapPassword = 'SecretPassword123';

      process.env.BOOTSTRAP_ADMIN_EMAIL = bootstrapEmail;
      process.env.BOOTSTRAP_ADMIN_PASSWORD = bootstrapPassword;

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockAuthProvider.hashPassword.mockResolvedValue('hashed');
      mockUsersService.createProfile.mockResolvedValue({ id: 'id', email: bootstrapEmail });
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.ADMIN]);

      const result = await service.bootstrapAdmin();

      expect(result).toBeUndefined(); // Bootstrap service returns void
    });
  });
});