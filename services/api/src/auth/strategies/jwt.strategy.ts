/**
 * JWT Strategy for Passport
 * Validates JWT tokens and extracts user information
 */
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      this.logger.warn('Invalid token payload: missing required fields');
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.type && payload.type !== 'access') {
      this.logger.warn(
        `Rejected non-access token for user ${payload.email}: type=${payload.type}`,
      );
      throw new UnauthorizedException('Invalid token type');
    }

    if (!payload.type) {
      this.logger.warn(
        `Rejected legacy token without explicit type for ${payload.email}`,
      );
      throw new UnauthorizedException('Invalid token type');
    }

    this.logger.debug(`Token validated for user: ${payload.email}`);

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles || [],
    };
  }
}
