import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const usersService = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    strategy = new JwtStrategy(
      { jwtSecret: 'test-secret' } as ConfigService,
      usersService as unknown as UsersService,
    );
    jest.clearAllMocks();
  });

  const payload = {
    sub: 'user-id',
    email: 'user@example.com',
    name: 'Test User',
    roles: ['CITIZEN'],
    type: 'access',
  };

  it('accepts a token for an active profile', async () => {
    usersService.findById.mockResolvedValue({ id: payload.sub, is_active: true });

    await expect(strategy.validate(payload)).resolves.toEqual({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
    });
  });

  it('rejects a token when the profile is inactive or missing', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
  });
});