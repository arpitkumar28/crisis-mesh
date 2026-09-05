import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLES_KEY } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

describe('IncidentsController', () => {
  let controller: IncidentsController;

  const mockIncidentsService = {
    getEligibleResponders: jest.fn(),
    assignResponder: jest.fn(),
  };

  const mockGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentsController],
      providers: [{ provide: IncidentsService, useValue: mockIncidentsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<IncidentsController>(IncidentsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('RBAC — role metadata on the assignment endpoints', () => {
    it('GET eligible-responders: allows ADMIN/AUTHORITY/RESPONDER, excludes CITIZEN and ANALYST', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        IncidentsController.prototype.eligibleResponders,
      );
      expect(roles).toEqual(
        expect.arrayContaining([
          UserRoleEnum.ADMIN,
          UserRoleEnum.AUTHORITY,
          UserRoleEnum.RESPONDER,
        ]),
      );
      expect(roles).not.toContain(UserRoleEnum.CITIZEN);
      expect(roles).not.toContain(UserRoleEnum.ANALYST);
    });

    it('PATCH :id/assignment: allows ADMIN/AUTHORITY/RESPONDER, excludes CITIZEN and ANALYST', () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        IncidentsController.prototype.assign,
      );
      expect(roles).toEqual(
        expect.arrayContaining([
          UserRoleEnum.ADMIN,
          UserRoleEnum.AUTHORITY,
          UserRoleEnum.RESPONDER,
        ]),
      );
      expect(roles).not.toContain(UserRoleEnum.CITIZEN);
      expect(roles).not.toContain(UserRoleEnum.ANALYST);
    });
  });

  describe('eligibleResponders', () => {
    it('delegates to the service and wraps the response envelope', async () => {
      const responders = [{ id: 'r1', name: 'R One', role: UserRoleEnum.RESPONDER }];
      mockIncidentsService.getEligibleResponders.mockResolvedValue(responders);

      const result = await controller.eligibleResponders();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(responders);
    });
  });

  describe('assign', () => {
    const user = { id: 'authority-1', roles: [UserRoleEnum.AUTHORITY] };

    it('rejects when assigned_to is omitted entirely (undefined)', async () => {
      await expect(
        controller.assign('incident-1', {}, user),
      ).rejects.toThrow(BadRequestException);
      expect(mockIncidentsService.assignResponder).not.toHaveBeenCalled();
    });

    it('accepts an explicit null and delegates as an unassignment', async () => {
      mockIncidentsService.assignResponder.mockResolvedValue({ id: 'incident-1', assigned_to: null });

      const result = await controller.assign(
        'incident-1',
        { assigned_to: null },
        user,
      );

      expect(mockIncidentsService.assignResponder).toHaveBeenCalledWith(
        'incident-1',
        null,
        user,
      );
      expect(result.message).toMatch(/unassigned/i);
    });

    it('delegates a real responder ID as an assignment', async () => {
      mockIncidentsService.assignResponder.mockResolvedValue({
        id: 'incident-1',
        assigned_to: 'responder-1',
      });

      const result = await controller.assign(
        'incident-1',
        { assigned_to: 'responder-1' },
        user,
      );

      expect(mockIncidentsService.assignResponder).toHaveBeenCalledWith(
        'incident-1',
        'responder-1',
        user,
      );
      expect(result.message).toMatch(/assigned successfully/i);
    });
  });
});
