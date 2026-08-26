/**
 * Roles Guard
 * Protects routes based on user roles
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      this.logger.warn('Roles guard: No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.roles || !Array.isArray(user.roles)) {
      this.logger.warn(`Roles guard: User ${user.email} has no roles`);
      throw new ForbiddenException('User has no roles assigned');
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      this.logger.warn(`Roles guard: User ${user.email} with roles ${user.roles} does not have required roles ${requiredRoles}`);
      throw new ForbiddenException('Insufficient permissions');
    }

    this.logger.debug(`Roles guard: User ${user.email} with roles ${user.roles} passed check for ${requiredRoles}`);
    return true;
  }
}
