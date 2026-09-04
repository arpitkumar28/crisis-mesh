import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile, UserRoleEnum } from '../entities/profile.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';

export interface CreateProfileDto {
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  location_id?: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  profile_picture_url?: string;
  location_id?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async createProfile(
    createDto: CreateProfileDto,
    defaultRole: UserRoleEnum = UserRoleEnum.CITIZEN,
  ): Promise<Profile> {
    // Check if email already exists
    const existingProfile = await this.profileRepository.findOne({
      where: { email: createDto.email },
    });
    if (existingProfile) {
      throw new ConflictException('Email already registered');
    }

    // Create profile
    const profile = this.profileRepository.create({
      email: createDto.email,
      password_hash: createDto.password_hash,
      name: createDto.name,
      phone: createDto.phone,
      location_id: createDto.location_id,
      is_active: true,
    });

    const savedProfile = await this.profileRepository.save(profile);

    // Assign default role
    await this.assignRole(savedProfile.id, defaultRole);

    return savedProfile;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { email, is_active: true },
    });
  }

  async findById(id: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { id, is_active: true },
    });
  }

  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findByIdIncludingInactive(id: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { id },
    });
  }

  async updateProfile(
    id: string,
    updateDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    Object.assign(profile, updateDto);
    return this.profileRepository.save(profile);
  }

  async updateLastLogin(id: string): Promise<void> {
    const profile = await this.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.last_login_at = new Date();
    await this.profileRepository.save(profile);
  }

  async assignRole(
    profileId: string,
    roleName: UserRoleEnum,
    assignedBy?: string,
  ): Promise<UserRole> {
    // Find or create role
    let role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      role = this.roleRepository.create({ name: roleName });
      role = await this.roleRepository.save(role);
    }

    // Check if role already assigned
    const existingAssignment = await this.userRoleRepository.findOne({
      where: { profile_id: profileId, role_id: role.id },
    });

    if (existingAssignment) {
      return existingAssignment;
    }

    // Create role assignment
    const userRole = this.userRoleRepository.create({
      profile_id: profileId,
      role_id: role.id,
      assigned_by: assignedBy,
    });

    return this.userRoleRepository.save(userRole);
  }

  async removeRole(profileId: string, roleName: UserRoleEnum): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const result = await this.userRoleRepository.delete({
      profile_id: profileId,
      role_id: role.id,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Role assignment not found');
    }
  }

  async getUserRoles(profileId: string): Promise<UserRoleEnum[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { profile_id: profileId },
      relations: {
        role: true,
      },
    });

    return userRoles.map((ur) => ur.role.name);
  }

  async hasRole(profileId: string, roleName: UserRoleEnum): Promise<boolean> {
    const roles = await this.getUserRoles(profileId);
    return roles.includes(roleName);
  }

  async deactivateProfile(id: string): Promise<void> {
    const profile = await this.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.is_active = false;
    await this.profileRepository.save(profile);
  }

  async activateProfile(id: string): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.is_active = true;
    await this.profileRepository.save(profile);
  }
}
