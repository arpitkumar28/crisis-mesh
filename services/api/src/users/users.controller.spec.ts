import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoleEnum } from '../entities/profile.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findByIdIncludingInactive: jest.fn(),
    getUserRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns users without password_hash, with roles attached', async () => {
      mockUsersService.findAll.mockResolvedValue([
        { id: 'u1', email: 'a@example.com', name: 'A', password_hash: 'SECRET_HASH', phone: null, location_id: null, is_active: true, last_login_at: null, created_at: new Date('2024-01-01') },
      ]);
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.CITIZEN]);

      const result = await controller.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password_hash');
      expect(result.data[0].roles).toEqual([UserRoleEnum.CITIZEN]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockUsersService.findByIdIncludingInactive.mockResolvedValue(null);
      await expect(controller.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('returns the user without password_hash when found', async () => {
      mockUsersService.findByIdIncludingInactive.mockResolvedValue({
        id: 'u1', email: 'a@example.com', name: 'A', password_hash: 'SECRET_HASH', phone: null, location_id: null, is_active: false, last_login_at: null, created_at: new Date('2024-01-01'),
      });
      mockUsersService.getUserRoles.mockResolvedValue([UserRoleEnum.ADMIN]);

      const result = await controller.findOne('u1');

      expect(result.data).not.toHaveProperty('password_hash');
      expect(result.data.is_active).toBe(false);
      expect(result.data.roles).toEqual([UserRoleEnum.ADMIN]);
    });
  });
});
