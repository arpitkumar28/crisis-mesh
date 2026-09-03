/**
 * Authentication Service
 * Provides authentication operations using the configured auth provider
 */
import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthProvider } from './providers/jwt.provider';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRoleEnum } from '../entities/profile.entity';

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authProvider: JwtAuthProvider,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    try {
      // Hash password
      const passwordHash = await this.authProvider.hashPassword(
        registerDto.password,
      );

      // Create profile with hashed password
      const profile = await this.usersService.createProfile(
        {
          email: registerDto.email,
          password_hash: passwordHash,
          name: registerDto.name,
          phone: registerDto.phone,
          location_id: registerDto.location_id,
        },
        UserRoleEnum.CITIZEN,
      );

      // Get user roles
      const roles = await this.usersService.getUserRoles(profile.id);

      // Generate tokens
      const userProfile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        roles: roles,
      };

      const access_token = await this.authProvider.generateToken(
        userProfile,
        'access',
      );
      const refresh_token = await this.authProvider.generateToken(
        userProfile,
        'refresh',
      );

      // Audit log
      await this.auditService.logAuthentication(
        profile.id,
        profile.email,
        'REGISTER',
        ipAddress,
        userAgent,
      );

      this.logger.log(`User registered successfully: ${profile.email}`);

      return {
        access_token,
        refresh_token,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          roles: roles,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Registration failed: ${error.message}`);
      throw new BadRequestException('Registration failed');
    }
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    try {
      const userProfile = await this.authProvider.validateCredentials(
        loginDto.email,
        loginDto.password,
      );

      const access_token = await this.authProvider.generateToken(
        userProfile,
        'access',
      );
      const refresh_token = await this.authProvider.generateToken(
        userProfile,
        'refresh',
      );

      // Audit log
      await this.auditService.logAuthentication(
        userProfile.id,
        userProfile.email,
        'LOGIN',
        ipAddress,
        userAgent,
      );

      this.logger.log(`User logged in successfully: ${userProfile.email}`);

      return {
        access_token,
        refresh_token,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          roles: userProfile.roles,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = await this.authProvider.validateToken(
        refreshToken,
        'refresh',
      );

      const profile = await this.usersService.findById(payload.sub);
      if (!profile) {
        throw new UnauthorizedException('Account is inactive');
      }

      const userProfile = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles || [],
      };

      const access_token = await this.authProvider.generateToken(
        userProfile,
        'access',
      );
      const refresh_token = await this.authProvider.refreshToken(refreshToken);

      this.logger.log(
        `Token refreshed successfully for user: ${userProfile.email}`,
      );

      return {
        access_token,
        refresh_token,
        user: userProfile,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw error;
    }
  }

  async assignRole(
    userId: string,
    role: UserRoleEnum,
    assignedBy: string,
  ): Promise<void> {
    try {
      await this.usersService.assignRole(userId, role, assignedBy);
      await this.auditService.logAuthorization(
        assignedBy,
        'ASSIGN_ROLE',
        `User:${userId}`,
        undefined,
      );
      this.logger.log(
        `Role ${role} assigned to user ${userId} by ${assignedBy}`,
      );
    } catch (error) {
      this.logger.error(`Role assignment failed: ${error.message}`);
      throw error;
    }
  }

  async removeRole(userId: string, role: UserRoleEnum): Promise<void> {
    try {
      await this.usersService.removeRole(userId, role);
      this.logger.log(`Role ${role} removed from user ${userId}`);
    } catch (error) {
      this.logger.error(`Role removal failed: ${error.message}`);
      throw error;
    }
  }

  async validateCredentials(email: string, password: string) {
    return this.authProvider.validateCredentials(email, password);
  }

  async generateToken(user: any, tokenType?: 'access' | 'refresh') {
    return this.authProvider.generateToken(user, tokenType);
  }

  async validateToken(token: string) {
    return this.authProvider.validateToken(token);
  }

  async hashPassword(password: string) {
    return this.authProvider.hashPassword(password);
  }

  async comparePassword(password: string, hash: string) {
    return this.authProvider.comparePassword(password, hash);
  }
}
