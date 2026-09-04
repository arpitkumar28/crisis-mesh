/**
 * Bootstrap Service
 * Secure, environment-controlled one-time ADMIN bootstrap for production setup
 * 
 * Security requirements:
 * - Opt-in via BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD environment variables
 * - Idempotent: does nothing if admin already exists with ADMIN role
 * - Never logs bootstrap password
 * - Uses existing password hashing and user creation mechanisms
 * - Does not affect normal registration (still creates CITIZEN users)
 * - Prevents privilege escalation of existing accounts
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { UsersService } from '../users/users.service';
import { JwtAuthProvider } from '../auth/providers/jwt.provider';
import { UserRoleEnum } from '../entities/profile.entity';

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);
  private readonly BOOTSTRAP_EMAIL_KEY = 'BOOTSTRAP_ADMIN_EMAIL';
  private readonly BOOTSTRAP_PASSWORD_KEY = 'BOOTSTRAP_ADMIN_PASSWORD';

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authProvider: JwtAuthProvider,
  ) {}

  /**
   * Execute the bootstrap process
   * Creates an admin user if bootstrap credentials are configured and user doesn't exist
   * Does nothing if bootstrap is not configured (opt-in behavior)
   * Does nothing if admin already exists with ADMIN role (idempotent)
   */
  async bootstrapAdmin(): Promise<void> {
    const bootstrapEmail = this.configService.get(this.BOOTSTRAP_EMAIL_KEY);
    const bootstrapPassword = this.configService.get(this.BOOTSTRAP_PASSWORD_KEY);

    // Opt-in: if not configured, do nothing silently
    if (!bootstrapEmail || !bootstrapPassword) {
      this.logger.log('Bootstrap admin provisioning skipped: environment variables not configured');
      return;
    }

    // Validate email format
    if (!this.isValidEmail(bootstrapEmail)) {
      this.logger.error('Bootstrap admin provisioning failed: invalid email format');
      throw new Error('Invalid BOOTSTRAP_ADMIN_EMAIL format');
    }

    // Validate password strength
    if (!this.isStrongPassword(bootstrapPassword)) {
      this.logger.error('Bootstrap admin provisioning failed: password does not meet security requirements');
      throw new Error('BOOTSTRAP_ADMIN_PASSWORD does not meet security requirements');
    }

    this.logger.log('Bootstrap admin provisioning started for configured identity');

    try {
      // Check if user already exists
      const existingProfile = await this.usersService.findByEmail(bootstrapEmail);

      if (existingProfile) {
        // User exists - check if they already have ADMIN role
        const existingRoles = await this.usersService.getUserRoles(existingProfile.id);

        if (existingRoles.includes(UserRoleEnum.ADMIN)) {
          // Idempotent: admin already exists with correct role, do nothing
          this.logger.log('Bootstrap admin provisioning completed: admin already exists with ADMIN role');
          return;
        } else {
          // Security: prevent privilege escalation of existing accounts
          this.logger.warn(
            'Bootstrap admin provisioning skipped: user exists but does not have ADMIN role. ' +
            'To prevent privilege escalation, bootstrap will not modify existing accounts.'
          );
          return;
        }
      }

      // User doesn't exist - create new admin
      this.logger.log('Creating new admin user via bootstrap');

      // Hash password using existing mechanism
      const passwordHash = await this.authProvider.hashPassword(bootstrapPassword);

      // Create profile with ADMIN role using existing service
      const profile = await this.usersService.createProfile(
        {
          email: bootstrapEmail,
          password_hash: passwordHash,
          name: 'Bootstrap Admin',
          phone: undefined,
          location_id: undefined,
        },
        UserRoleEnum.ADMIN,
      );

      // Verify the role was assigned correctly
      const roles = await this.usersService.getUserRoles(profile.id);
      if (!roles.includes(UserRoleEnum.ADMIN)) {
        throw new Error('Failed to assign ADMIN role during bootstrap');
      }

      this.logger.log('Bootstrap admin provisioning completed for configured identity');
    } catch (error) {
      this.logger.error(`Bootstrap admin provisioning failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Minimum 8 characters, at least one uppercase, one lowercase, one number
   */
  private isStrongPassword(password: string): boolean {
    if (password.length < 8) {
      return false;
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUppercase && hasLowercase && hasNumber;
  }

  /**
   * Check if bootstrap is configured
   */
  isBootstrapConfigured(): boolean {
    const email = this.configService.get(this.BOOTSTRAP_EMAIL_KEY);
    const password = this.configService.get(this.BOOTSTRAP_PASSWORD_KEY);
    return !!(email && password);
  }
}