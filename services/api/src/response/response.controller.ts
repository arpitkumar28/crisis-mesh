import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';
import { ResponseService } from './response.service';

@Controller('v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResponseController {
  constructor(private readonly response: ResponseService) {}
  @Get('resources')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  resources() {
    return this.response.listResources();
  }
  @Get('resources/:id')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  resource(@Param('id') id: string) {
    return this.response.getResource(id);
  }
  @Get('shelters')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  shelters() {
    return this.response.listShelters();
  }
  @Get('shelters/:id')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  shelter(@Param('id') id: string) {
    return this.response.getShelter(id);
  }
}
