/**
 * Authentication Service
 * Provides authentication operations using the configured auth provider
 */
import { Injectable } from '@nestjs/common';
import { JwtAuthProvider } from './providers/jwt.provider';

@Injectable()
export class AuthService {
  constructor(private readonly authProvider: JwtAuthProvider) {}

  async validateCredentials(email: string, password: string) {
    return this.authProvider.validateCredentials(email, password);
  }

  async generateToken(user: any) {
    return this.authProvider.generateToken(user);
  }

  async validateToken(token: string) {
    return this.authProvider.validateToken(token);
  }

  async refreshToken(token: string) {
    return this.authProvider.refreshToken(token);
  }

  async hashPassword(password: string) {
    return this.authProvider.hashPassword(password);
  }

  async comparePassword(password: string, hash: string) {
    return this.authProvider.comparePassword(password, hash);
  }
}
