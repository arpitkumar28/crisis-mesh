import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Device, DeviceStatus } from './device.entity';

@Entity('device_status_history')
@Index(['device_id', 'timestamp'])
export class DeviceStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    enumName: 'device_status_enum',
  })
  status: DeviceStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  timestamp: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations
  @ManyToOne(() => Device, (device) => device.status_history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;
}
