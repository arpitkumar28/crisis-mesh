import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { GeographicLocation } from './geographic-location.entity';
import { AlertSeverity } from './alert.entity';

export enum IncidentType {
  DISASTER = 'DISASTER',
  EMERGENCY = 'EMERGENCY',
  ACCIDENT = 'ACCIDENT',
  HAZARD = 'HAZARD',
  OTHER = 'OTHER',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.REPORTED,
  })
  status: IncidentStatus;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'location_id', nullable: true })
  location_id: string;

  @ManyToOne(() => GeographicLocation, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: GeographicLocation;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM,
  })
  severity: AlertSeverity;

  @Column({ name: 'reported_by' })
  reported_by: string;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'reported_by' })
  reporter: Profile;

  @Column({ name: 'assigned_to', nullable: true })
  assigned_to: string;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: Profile;

  @Column({ name: 'reported_at', type: 'timestamp with time zone', default: () => 'NOW()' })
  reported_at: Date;

  @Column({ name: 'resolved_at', type: 'timestamp with time zone', nullable: true })
  resolved_at: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updated_at: Date;
}
