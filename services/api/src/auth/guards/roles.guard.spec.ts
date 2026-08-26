import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../roles.decorator';
import { UserRoleEnum } from '../../entities/profile.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    const mockContext = createMockExecutionContext({
      id: 'user-id',
      roles: [UserRoleEnum.CITIZEN],
    });

    mockReflector.getAllAndOverride.mockReturnValue([]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const mockContext = createMockExecutionContext({
      id: 'user-id',
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.CITIZEN],
    });

    mockReflector.getAllAndOverride.mockReturnValue([UserRoleEnum.ADMIN]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user is not authenticated', () => {
    const mockContext = createMockExecutionContext();

    mockReflector.getAllAndOverride.mockReturnValue([UserRoleEnum.ADMIN]);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no roles', () => {
    const mockContext = createMockExecutionContext({ id: 'user-id' });

    mockReflector.getAllAndOverride.mockReturnValue([UserRoleEnum.ADMIN]);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    const mockContext = createMockExecutionContext({
      id: 'user-id',
      roles: [UserRoleEnum.CITIZEN],
    });

    mockReflector.getAllAndOverride.mockReturnValue([UserRoleEnum.ADMIN]);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should allow access when user has one of multiple required roles', () => {
    const mockContext = createMockExecutionContext({
      id: 'user-id',
      roles: [UserRoleEnum.RESPONDER],
    });

    mockReflector.getAllAndOverride.mockReturnValue([
      UserRoleEnum.ADMIN,
      UserRoleEnum.RESPONDER,
      UserRoleEnum.AUTHORITY,
    ]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });
});
