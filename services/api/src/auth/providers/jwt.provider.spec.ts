import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthProvider, UserProfile } from './jwt.provider';
import { UsersService } from '../../users/users.service';
import { UserRoleEnum } from '../../entities/profile.entity';

describe('JwtAuthProvider', () => {
  let provider: JwtAuthProvider;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    getUserRoles: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthProvider,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    provider = module.get<JwtAuthProvider>(JwtAuthProvider);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('validateCredentials', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashed_password';

    it('should successfully validate valid credentials', async () => {
      const mockProfile = {
        id: 'user-id',
        email: email,
        name: 'Test User',
        password_hash: hashedPassword,
        is_active: true,
      };
      const mockRoles = [UserRoleEnum.CITIZEN];

      mockUsersService.findByEmail.mockResolvedValue(mockProfile);
      (provider as any).comparePassword = jest.fn().mockResolvedValue(true);
      mockUsersService.getUserRoles.mockResolvedValue(mockRoles);
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);

      const result = await provider.validateCredentials(email, password);

      expect(result).toEqual({
        id: mockProfile.id,
        email: mockProfile.email,
        name: mockProfile.name,
        roles: mockRoles,
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith(mockProfile.id);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(provider.validateCredentials(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockProfile = {
        id: 'user-id',
        email: email,
        name: 'Test User',
        password_hash: hashedPassword,
        is_active: false,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockProfile);

      await expect(provider.validateCredentials(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password hash is missing', async () => {
      const mockProfile = {
        id: 'user-id',
        email: email,
        name: 'Test User',
        password_hash: null,
        is_active: true,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockProfile);

      await expect(provider.validateCredentials(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockProfile = {
        id: 'user-id',
        email: email,
        name: 'Test User',
        password_hash: hashedPassword,
        is_active: true,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockProfile);
      (provider as any).comparePassword = jest.fn().mockResolvedValue(false);

      await expect(provider.validateCredentials(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token for user', async () => {
      const userProfile: UserProfile = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
      };

      mockJwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await provider.generateToken(userProfile);

      expect(result).toBe('jwt_token');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          roles: userProfile.roles,
          type: 'access',
        }),
      );
    });
  });

  describe('validateToken', () => {
    it('should validate valid token', async () => {
      const token = 'valid_token';
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await provider.validateToken(token);

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid_token';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(provider.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should issue a new refresh token for a valid refresh token', async () => {
      const oldToken = 'old_token';
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
        type: 'refresh',
        jti: 'legacy-jti-1',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockJwtService.signAsync.mockResolvedValue('new_refresh_token');

      const result = await provider.refreshToken(oldToken);

      expect(result).toBe('new_refresh_token');
    });

    it('should revoke the old refresh token after rotation', async () => {
      const oldToken = 'old_refresh_token';
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
        type: 'refresh',
        jti: 'revoked-jti-1',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockJwtService.signAsync.mockResolvedValue('new_refresh_token');

      const rotated = await provider.refreshToken(oldToken);

      expect(rotated).toBe('new_refresh_token');
      await expect(provider.refreshToken(oldToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject access tokens when used as refresh tokens', async () => {
      const accessToken = 'access_token';
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
        type: 'access',
        jti: 'access-jti',
      });

      await expect(provider.refreshToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject malformed refresh tokens', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Malformed token'));

      await expect(provider.refreshToken('malformed.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject expired refresh tokens', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(provider.refreshToken('expired_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject revoked refresh tokens', async () => {
      const oldToken = 'old_refresh_token';
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
        type: 'refresh',
        jti: 'revoked-jti-2',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockJwtService.signAsync.mockResolvedValue('new_refresh_token');

      await provider.refreshToken(oldToken);
      await expect(provider.refreshToken(oldToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const invalidToken = 'invalid_token';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(provider.refreshToken(invalidToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeRefreshToken (used by logout)', () => {
    it('revokes a valid refresh token so a later refresh attempt with it is rejected', async () => {
      const token = 'session_refresh_token';
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        roles: [UserRoleEnum.CITIZEN],
        type: 'refresh',
        jti: 'logout-jti-1',
      });

      await provider.revokeRefreshToken(token);

      await expect(provider.refreshToken(token)).rejects.toThrow(UnauthorizedException);
    });

    it('does nothing and does not throw for an empty token', async () => {
      await expect(provider.revokeRefreshToken('')).resolves.toBeUndefined();
    });

    it('does not throw for an already-invalid/malformed token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));
      await expect(provider.revokeRefreshToken('garbage')).resolves.toBeUndefined();
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'password123';

      const result = await provider.hashPassword(password);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(password);
      expect(result).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });
  });

  describe('comparePassword', () => {
    it('should compare password with hash', async () => {
      const password = 'password123';
      const hash = await provider.hashPassword(password);

      const result = await provider.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hash = await provider.hashPassword(password);

      const result = await provider.comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });
  });
});
