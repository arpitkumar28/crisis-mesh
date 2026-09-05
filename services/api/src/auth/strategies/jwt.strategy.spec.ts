import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '../../config/config.service';

/**
 * JwtStrategy.validate() is what GET /v1/auth/me (and every other
 * JwtAuthGuard-protected route) ultimately relies on to populate the
 * authenticated user from a verified JWT payload — this is what makes
 * "/auth/me returns the actual authenticated database user" true rather
 * than a client-trusted claim: Passport has already cryptographically
 * verified the token signature before validate() ever runs.
 */
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    jwtSecret: 'test-secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('returns the real user identity carried in a verified access-token payload', async () => {
    const payload = {
      sub: 'user-id-1',
      email: 'real.user@example.com',
      name: 'Real User',
      roles: ['CITIZEN'],
      type: 'access',
      jti: 'jti-1',
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      id: 'user-id-1',
      email: 'real.user@example.com',
      name: 'Real User',
      roles: ['CITIZEN'],
    });
  });

  it('rejects a payload missing sub', async () => {
    await expect(
      strategy.validate({ email: 'x@example.com', type: 'access' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a payload missing email', async () => {
    await expect(strategy.validate({ sub: 'user-id', type: 'access' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a refresh token presented as an access token', async () => {
    await expect(
      strategy.validate({ sub: 'user-id', email: 'x@example.com', type: 'refresh' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a legacy token with no explicit type', async () => {
    await expect(
      strategy.validate({ sub: 'user-id', email: 'x@example.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
