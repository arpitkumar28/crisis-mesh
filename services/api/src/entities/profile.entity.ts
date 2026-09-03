import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

export enum UserRoleEnum {
  CITIZEN = 'CITIZEN',
  RESPONDER = 'RESPONDER',
  AUTHORITY = 'AUTHORITY',
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  profile_picture_url: string;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @OneToMany(() => UserRole, (userRole) => userRole.profile)
  user_roles: UserRole[];
}
