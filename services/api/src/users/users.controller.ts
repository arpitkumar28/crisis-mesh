import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Profile, UserRoleEnum } from '../entities/profile.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

function toSafeUser(profile: Profile, roles: UserRoleEnum[]) {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    location_id: profile.location_id,
    is_active: profile.is_active,
    last_login_at: profile.last_login_at,
    created_at: profile.created_at,
    roles,
  };
}

@Controller('v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const profiles = await this.usersService.findAll();
    const data = await Promise.all(
      profiles.map(async (profile) => {
        const roles = await this.usersService.getUserRoles(profile.id);
        return toSafeUser(profile, roles);
      }),
    );
    return {
      success: true,
      message: 'Users retrieved successfully',
      data,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const profile = await this.usersService.findByIdIncludingInactive(id);
    if (!profile) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const roles = await this.usersService.getUserRoles(profile.id);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: toSafeUser(profile, roles),
      request_id: crypto.randomUUID(),
    };
  }
}
