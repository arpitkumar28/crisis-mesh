import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
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

  // Excluded from every JSON response via the global ClassSerializerInterceptor
  // (see main.ts) — this is a defense-in-depth backstop, not the only guard:
  // controllers should still avoid returning raw Profile relations
  // unnecessarily. Loading it (e.g. to check a password at login) is
  // unaffected, since @Exclude only strips it at response-serialization
  // time, never at query time.
  @Exclude()
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
