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
import { Incident } from './incident.entity';

export enum AlertType {
  WEATHER = 'WEATHER',
  FLOOD = 'FLOOD',
  EARTHQUAKE = 'EARTHQUAKE',
  WILDFIRE = 'WILDFIRE',
  LANDSLIDE = 'LANDSLIDE',
  TSUNAMI = 'TSUNAMI',
  CYCLONE = 'CYCLONE',
  MANUAL = 'MANUAL',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type: AlertType;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
  })
  severity: AlertSeverity;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'location_id', nullable: true })
  location_id: string;

  @ManyToOne(() => GeographicLocation, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: GeographicLocation;

  @Column({ name: 'issued_by' })
  issued_by: string;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'issued_by' })
  issuer: Profile;

  @Column({ name: 'issued_at', type: 'timestamp with time zone', default: () => 'NOW()' })
  issued_at: Date;

  @Column({ name: 'expires_at', type: 'timestamp with time zone', nullable: true })
  expires_at: Date;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  affected_regions: string[];

  @Column({ name: 'incident_id', nullable: true })
  incident_id: string;

  @ManyToOne(() => Incident, { nullable: true })
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updated_at: Date;
}
