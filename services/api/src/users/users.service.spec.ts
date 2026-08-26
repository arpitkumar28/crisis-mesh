import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { Profile } from '../entities/profile.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { UserRoleEnum } from '../entities/profile.entity';

describe('UsersService', () => {
  let service: UsersService;
  let profileRepository: Repository<Profile>;
  let roleRepository: Repository<Role>;
  let userRoleRepository: Repository<UserRole>;

  const mockProfileRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRoleRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    userRoleRepository = module.get<Repository<UserRole>>(getRepositoryToken(UserRole));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProfile', () => {
    const createDto = {
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      phone: '+1234567890',
    };

    it('should successfully create a new profile', async () => {
      const mockProfile = {
        id: 'profile-id',
        email: createDto.email,
        name: createDto.name,
        is_active: true,
      };

      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue(mockProfile);
      mockUserRoleRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.findOne.mockResolvedValue({ id: 'role-id', name: UserRoleEnum.CITIZEN });
      mockUserRoleRepository.create.mockReturnValue({ id: 'user-role-id' });
      mockUserRoleRepository.save.mockResolvedValue({ id: 'user-role-id' });

      const result = await service.createProfile(createDto, UserRoleEnum.CITIZEN);

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingProfile = { id: 'existing-id', email: createDto.email };
      mockProfileRepository.findOne.mockResolvedValue(existingProfile);

      await expect(service.createProfile(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find profile by email', async () => {
      const email = 'test@example.com';
      const mockProfile = { id: 'profile-id', email, is_active: true };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findByEmail(email);

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email, is_active: true },
      });
    });

    it('should return null if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find profile by id', async () => {
      const id = 'profile-id';
      const mockProfile = { id, email: 'test@example.com', is_active: true };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findById(id);

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id, is_active: true },
      });
    });

    it('should return null if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const id = 'profile-id';
      const updateDto = { name: 'Updated Name' };
      const mockProfile = { id, email: 'test@example.com', is_active: true };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue({ ...mockProfile, ...updateDto });

      const result = await service.updateProfile(id, updateDto);

      expect(result).toEqual({ ...mockProfile, ...updateDto });
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const id = 'profile-id';
      const mockProfile = { id, email: 'test@example.com', is_active: true };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue(mockProfile);

      await service.updateLastLogin(id);

      expect(mockProfileRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.updateLastLogin('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const profileId = 'profile-id';
      const roleName = UserRoleEnum.ADMIN;
      const assignedBy = 'admin-id';

      mockRoleRepository.findOne.mockResolvedValue({ id: 'role-id', name: roleName });
      mockUserRoleRepository.findOne.mockResolvedValue(null);
      mockUserRoleRepository.create.mockReturnValue({ id: 'user-role-id' });
      mockUserRoleRepository.save.mockResolvedValue({ id: 'user-role-id' });

      const result = await service.assignRole(profileId, roleName, assignedBy);

      expect(result).toHaveProperty('id');
      expect(mockUserRoleRepository.save).toHaveBeenCalled();
    });

    it('should return existing assignment if already assigned', async () => {
      const profileId = 'profile-id';
      const roleName = UserRoleEnum.ADMIN;
      const existingAssignment = { id: 'existing-assignment-id' };

      mockRoleRepository.findOne.mockResolvedValue({ id: 'role-id', name: roleName });
      mockUserRoleRepository.findOne.mockResolvedValue(existingAssignment);

      const result = await service.assignRole(profileId, roleName);

      expect(result).toEqual(existingAssignment);
      expect(mockUserRoleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('removeRole', () => {
    it('should remove role from user', async () => {
      const profileId = 'profile-id';
      const roleName = UserRoleEnum.ADMIN;

      mockRoleRepository.findOne.mockResolvedValue({ id: 'role-id', name: roleName });
      mockUserRoleRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeRole(profileId, roleName);

      expect(mockUserRoleRepository.delete).toHaveBeenCalledWith({
        profile_id: profileId,
        role_id: 'role-id',
      });
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.removeRole('profile-id', UserRoleEnum.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue({ id: 'role-id', name: UserRoleEnum.ADMIN });
      mockUserRoleRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.removeRole('profile-id', UserRoleEnum.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserRoles', () => {
    it('should get user roles', async () => {
      const profileId = 'profile-id';
      const mockUserRoles = [
        { role: { name: UserRoleEnum.ADMIN } },
        { role: { name: UserRoleEnum.CITIZEN } },
      ];

      mockUserRoleRepository.find.mockResolvedValue(mockUserRoles);

      const result = await service.getUserRoles(profileId);

      expect(result).toEqual([UserRoleEnum.ADMIN, UserRoleEnum.CITIZEN]);
      expect(mockUserRoleRepository.find).toHaveBeenCalledWith({
        where: { profile_id: profileId },
        relations: { role: true },
      });
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', async () => {
      const profileId = 'profile-id';
      const roleName = UserRoleEnum.ADMIN;

      jest.spyOn(service, 'getUserRoles').mockResolvedValue([UserRoleEnum.ADMIN, UserRoleEnum.CITIZEN]);

      const result = await service.hasRole(profileId, roleName);

      expect(result).toBe(true);
    });

    it('should return false if user does not have role', async () => {
      const profileId = 'profile-id';
      const roleName = UserRoleEnum.ADMIN;

      jest.spyOn(service, 'getUserRoles').mockResolvedValue([UserRoleEnum.CITIZEN]);

      const result = await service.hasRole(profileId, roleName);

      expect(result).toBe(false);
    });
  });

  describe('deactivateProfile', () => {
    it('should deactivate profile', async () => {
      const id = 'profile-id';
      const mockProfile = { id, email: 'test@example.com', is_active: true };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue({ ...mockProfile, is_active: false });

      await service.deactivateProfile(id);

      expect(mockProfileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false }),
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.deactivateProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateProfile', () => {
    it('should activate profile', async () => {
      const id = 'profile-id';
      const mockProfile = { id, email: 'test@example.com', is_active: false };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue({ ...mockProfile, is_active: true });

      await service.activateProfile(id);

      expect(mockProfileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: true }),
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.activateProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
