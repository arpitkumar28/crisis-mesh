import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AssignRoleDto } from './assign-role.dto';
import { UserRoleEnum } from '../../entities/profile.entity';

describe('AssignRoleDto', () => {
  it('accepts a valid userId/role pair', async () => {
    const dto = plainToInstance(AssignRoleDto, {
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      role: UserRoleEnum.ADMIN,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a role string outside UserRoleEnum instead of silently creating a bogus role', async () => {
    const dto = plainToInstance(AssignRoleDto, {
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      role: 'SUPER_ADMIN',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('rejects a non-UUID userId', async () => {
    const dto = plainToInstance(AssignRoleDto, {
      userId: 'not-a-uuid',
      role: UserRoleEnum.ADMIN,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });
});
