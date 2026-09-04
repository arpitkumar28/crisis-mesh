import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const logs = await this.auditService.findAll(
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
    );
    return {
      success: true,
      message: 'Audit logs retrieved successfully',
      data: logs,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const logs = await this.auditService.getUserAuditLogs(
      userId,
      limit ? parseInt(limit, 10) : 100,
    );
    return {
      success: true,
      message: 'User audit logs retrieved successfully',
      data: logs,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.auditService.getEntityAuditLogs(
      entityType,
      entityId,
      limit ? parseInt(limit, 10) : 100,
    );
    return {
      success: true,
      message: 'Entity audit logs retrieved successfully',
      data: logs,
      request_id: crypto.randomUUID(),
    };
  }
}
