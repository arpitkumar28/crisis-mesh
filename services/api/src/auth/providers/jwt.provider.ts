/**
 * JWT Authentication Provider
 * Temporary implementation for Neon PostgreSQL
 * This will be replaced with Supabase Auth in production
 */
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthProvider } from '../auth-provider.interface';
import { UsersService } from '../../users/users.service';
import { UserRoleEnum } from '../../entities/profile.entity';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: UserRoleEnum[];
}

@Injectable()
export class JwtAuthProvider implements IAuthProvider {
  private readonly logger = new Logger(JwtAuthProvider.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateCredentials(email: string, password: string): Promise<UserProfile> {
    try {
      const profile = await this.usersService.findByEmail(email);

      if (!profile) {
        this.logger.warn(`Authentication failed: User not found for email ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!profile.is_active) {
        this.logger.warn(`Authentication failed: Inactive user ${email}`);
        throw new UnauthorizedException('Account is inactive');
      }

      if (!profile.password_hash) {
        this.logger.warn(`Authentication failed: No password hash for user ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.comparePassword(password, profile.password_hash);

      if (!isPasswordValid) {
        this.logger.warn(`Authentication failed: Invalid password for user ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get user roles
      const roles = await this.usersService.getUserRoles(profile.id);

      // Update last login
      await this.usersService.updateLastLogin(profile.id);

      this.logger.log(`Authentication successful for user ${email}`);

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        roles: roles,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Authentication error for email ${email}: ${error.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async generateToken(user: UserProfile): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
    return this.jwtService.signAsync(payload);
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshToken(token: string): Promise<string> {
    try {
      const payload = await this.validateToken(token);

      // Reconstruct user profile from payload
      const userProfile: UserProfile = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles || [],
      };

      return this.generateToken(userProfile);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
