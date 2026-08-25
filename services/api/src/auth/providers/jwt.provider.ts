/**
 * JWT Authentication Provider
 * Temporary implementation for Neon PostgreSQL
 * This will be replaced with Supabase Auth in production
 */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthProvider } from '../auth-provider.interface';

@Injectable()
export class JwtAuthProvider implements IAuthProvider {
  constructor(private readonly jwtService: JwtService) {}

  async validateCredentials(email: string, password: string): Promise<any> {
    // This will be implemented with database integration
    // For now, this is a placeholder
    throw new Error('Database integration required for credential validation');
  }

  async generateToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async refreshToken(token: string): Promise<string> {
    // Token refresh logic
    const payload = await this.validateToken(token);
    return this.generateToken(payload);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
