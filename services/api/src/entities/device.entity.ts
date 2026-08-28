import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Sensor } from './sensor.entity';
import { Gateway } from './gateway.entity';
import { MeshLink } from './mesh-link.entity';
import { DeviceStatusHistory } from './device-status-history.entity';
import { GeographicLocation } from './geographic-location.entity';

export enum DeviceType {
  SENSOR = 'SENSOR',
  RELAY = 'RELAY',
  GATEWAY = 'GATEWAY',
  SIMULATOR = 'SIMULATOR',
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  UNREACHABLE = 'UNREACHABLE',
  ERROR = 'ERROR',
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
    enumName: 'device_type_enum',
  })
  type: DeviceType;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.OFFLINE,
    enumName: 'device_status_enum',
  })
  status: DeviceStatus;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @ManyToOne(() => GeographicLocation, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: GeographicLocation;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  serial_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  firmware_version: string;

  @Column({ type: 'int', nullable: true })
  battery_level: number;

  @Column({ type: 'int', nullable: true })
  signal_strength: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_seen: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @OneToMany(() => Sensor, (sensor) => sensor.device)
  sensors: Sensor[];

  @OneToMany(() => Gateway, (gateway) => gateway.device)
  gateways: Gateway[];

  @OneToMany(() => MeshLink, (link) => link.source_device)
  source_links: MeshLink[];

  @OneToMany(() => MeshLink, (link) => link.target_device)
  target_links: MeshLink[];

  @OneToMany(() => DeviceStatusHistory, (history) => history.device)
  status_history: DeviceStatusHistory[];
}
