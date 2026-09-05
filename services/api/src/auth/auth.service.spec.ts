import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthProvider } from './providers/jwt.provider';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRoleEnum } from '../entities/profile.entity';

describe('AuthService', () => {
  let service: AuthService;
  let authProvider: JwtAuthProvider;
  let usersService: UsersService;
  let auditService: AuditService;

  const mockAuthProvider = {
    hashPassword: jest.fn(),
    validateCredentials: jest.fn(),
    generateToken: jest.fn(),
    comparePassword: jest.fn(),
    refreshToken: jest.fn(),
    validateToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    createProfile: jest.fn(),
    getUserRoles: jest.fn(),
    updateLastLogin: jest.fn(),
    assignRole: jest.fn(),
    removeRole: jest.fn(),
  };

  const mockAuditService = {
    logAuthentication: jest.fn(),
    logAuthorization: jest.fn(),
    logDataChange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtAuthProvider,
          useValue: mockAuthProvider,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authProvider = module.get<JwtAuthProvider>(JwtAuthProvider);
    usersService = module.get<UsersService>(UsersService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashed_password';
      const mockProfile = {
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
      };
      const mockRoles = [UserRoleEnum.CITIZEN];
      const mockUserProfile = {
        id: mockProfile.id,
        email: mockProfile.email,
        name: mockProfile.name,
        roles: mockRoles,
      };

      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createProfile.mockResolvedValue(mockProfile);
      mockUsersService.getUserRoles.mockResolvedValue(mockRoles);
      mockAuthProvider.generateToken.mockResolvedValue('access_token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).toEqual({
        id: mockProfile.id,
        email: mockProfile.email,
        name: mockProfile.name,
        roles: mockRoles,
      });
      expect(mockAuthProvider.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(mockUsersService.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password_hash: hashedPassword,
          name: registerDto.name,
        }),
        UserRoleEnum.CITIZEN,
      );
      expect(auditService.logAuthentication).toHaveBeenCalledWith(
        mockProfile.id,
        mockProfile.email,
        'REGISTER',
        undefined,
        undefined,
      );
    });

    it('never stores the plaintext password — only the hashed value reaches the profile', async () => {
      const hashedPassword = 'hashed_password';
      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createProfile.mockResolvedValue({ id: 'user-id', email: registerDto.email, name: registerDto.name });
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]);
      mockAuthProvider.generateToken.mockResolvedValue('token');

      await service.register(registerDto);

      const profileArg = mockUsersService.createProfile.mock.calls[0][0];
      expect(profileArg.password_hash).toBe(hashedPassword);
      expect(profileArg.password_hash).not.toBe(registerDto.password);
      expect(profileArg).not.toHaveProperty('password');
    });

    it('cannot be used to escalate role — an injected role field is ignored and CITIZEN is always assigned', async () => {
      mockAuthProvider.hashPassword.mockResolvedValue('hashed');
      mockUsersService.createProfile.mockResolvedValue({ id: 'user-id', email: registerDto.email, name: registerDto.name });
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]);
      mockAuthProvider.generateToken.mockResolvedValue('token');

      // RegisterDto has no `role` property at all, and the global
      // ValidationPipe (whitelist + forbidNonWhitelisted, see main.ts)
      // would reject this at the HTTP layer before it ever reaches here.
      // This proves the service layer itself never reads/forwards such
      // a field even if something injected it past validation.
      const maliciousDto = { ...registerDto, role: UserRoleEnum.ADMIN } as any;

      const result = await service.register(maliciousDto);

      expect(mockUsersService.createProfile).toHaveBeenCalledWith(
        expect.not.objectContaining({ role: expect.anything() }),
        UserRoleEnum.CITIZEN,
      );
      expect(result.user.roles).toEqual([UserRoleEnum.CITIZEN]);
    });

    it('never returns password_hash in the auth result', async () => {
      mockAuthProvider.hashPassword.mockResolvedValue('hashed');
      mockUsersService.createProfile.mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
        password_hash: 'hashed',
      });
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]);
      mockAuthProvider.generateToken.mockResolvedValue('token');

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockAuthProvider.hashPassword.mockResolvedValue('hashed');
      mockUsersService.createProfile.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException on registration failure', async () => {
      mockAuthProvider.hashPassword.mockResolvedValue('hashed');
      mockUsersService.createProfile.mockRejectedValue(new Error('DB error'));

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUserProfile = {
        id: 'user-id',
        email: loginDto.email,
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
      };

      mockAuthProvider.validateCredentials.mockResolvedValue(mockUserProfile);
      mockAuthProvider.generateToken.mockResolvedValue('access_token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).toEqual(mockUserProfile);
      expect(mockAuthProvider.validateCredentials).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(auditService.logAuthentication).toHaveBeenCalledWith(
        mockUserProfile.id,
        mockUserProfile.email,
        'LOGIN',
        undefined,
        undefined,
      );
    });

    it('should throw error on invalid credentials', async () => {
      mockAuthProvider.validateCredentials.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('never returns password_hash in the auth result', async () => {
      mockAuthProvider.validateCredentials.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
        password_hash: 'hashed_password',
      });
      mockAuthProvider.generateToken.mockResolvedValue('access_token');

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('refreshToken', () => {
    it('should issue a new access token and a rotated refresh token for a valid refresh token', async () => {
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
      };

      mockAuthProvider.validateToken.mockResolvedValue(mockPayload);
      mockAuthProvider.generateToken.mockResolvedValueOnce('new_access_token');
      mockAuthProvider.refreshToken.mockResolvedValue('rotated_refresh_token');

      const result = await service.refreshToken('old_refresh_token');

      expect(result).toHaveProperty('access_token', 'new_access_token');
      expect(result).toHaveProperty('refresh_token', 'rotated_refresh_token');
      expect(mockAuthProvider.validateToken).toHaveBeenCalledWith(
        'old_refresh_token',
        'refresh',
      );
      expect(mockAuthProvider.generateToken).toHaveBeenCalledWith(
        {
          id: mockPayload.sub,
          email: mockPayload.email,
          name: mockPayload.name,
          roles: mockPayload.roles,
        },
        'access',
      );
      expect(mockAuthProvider.refreshToken).toHaveBeenCalledWith(
        'old_refresh_token',
      );
      expect(result.user).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        name: mockPayload.name,
        roles: mockPayload.roles,
      });
    });

    it('should reject invalid refresh tokens', async () => {
      mockAuthProvider.validateToken.mockRejectedValue(
        new UnauthorizedException('Invalid token'),
      );

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject a malformed token before any rotation occurs', async () => {
      mockAuthProvider.validateToken.mockRejectedValue(
        new UnauthorizedException('Malformed token'),
      );

      await expect(service.refreshToken('malformed.token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthProvider.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('revokes the presented refresh token and audits the logout', async () => {
      mockAuthProvider.revokeRefreshToken.mockResolvedValue(undefined);

      await service.logout('user-id', 'test@example.com', 'a_refresh_token', '127.0.0.1', 'test-agent');

      expect(mockAuthProvider.revokeRefreshToken).toHaveBeenCalledWith('a_refresh_token');
      expect(auditService.logAuthentication).toHaveBeenCalledWith(
        'user-id',
        'test@example.com',
        'LOGOUT',
        '127.0.0.1',
        'test-agent',
      );
    });

    it('does not attempt to revoke anything when no refresh token is presented, but still audits', async () => {
      await service.logout('user-id', 'test@example.com');

      expect(mockAuthProvider.revokeRefreshToken).not.toHaveBeenCalled();
      expect(auditService.logAuthentication).toHaveBeenCalledWith(
        'user-id',
        'test@example.com',
        'LOGOUT',
        undefined,
        undefined,
      );
    });
  });

  describe('assignRole', () => {
    it('should successfully assign role to user', async () => {
      const userId = 'user-id';
      const role = UserRoleEnum.ADMIN;
      const assignedBy = 'admin-id';

      mockUsersService.assignRole.mockResolvedValue(undefined);

      await service.assignRole(userId, role, assignedBy);

      expect(mockUsersService.assignRole).toHaveBeenCalledWith(userId, role, assignedBy);
      expect(auditService.logAuthorization).toHaveBeenCalledWith(
        assignedBy,
        'ASSIGN_ROLE',
        `User:${userId}`,
        undefined,
      );
    });
  });

  describe('removeRole', () => {
    it('should successfully remove role from user', async () => {
      const userId = 'user-id';
      const role = UserRoleEnum.ADMIN;

      mockUsersService.removeRole.mockResolvedValue(undefined);

      await service.removeRole(userId, role);

      expect(mockUsersService.removeRole).toHaveBeenCalledWith(userId, role);
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      mockAuthProvider.hashPassword.mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockAuthProvider.hashPassword).toHaveBeenCalledWith(password);
    });
  });

  describe('comparePassword', () => {
    it('should compare password with hash', async () => {
      const password = 'password123';
      const hash = 'hashed_password';
      const isValid = true;

      mockAuthProvider.comparePassword.mockResolvedValue(isValid);

      const result = await service.comparePassword(password, hash);

      expect(result).toBe(isValid);
      expect(mockAuthProvider.comparePassword).toHaveBeenCalledWith(password, hash);
    });
  });
});
