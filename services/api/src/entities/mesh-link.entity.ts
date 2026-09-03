import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from './device.entity';

@Entity('mesh_links')
export class MeshLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  source_device_id: string;

  @Column({ type: 'uuid' })
  target_device_id: string;

  @Column({ type: 'int', nullable: true })
  link_quality: number;

  @Column({ type: 'int', nullable: true })
  latency_ms: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_ping: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Device, (device) => device.source_links, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'source_device_id' })
  source_device: Device;

  @ManyToOne(() => Device, (device) => device.target_links, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_device_id' })
  target_device: Device;
}
