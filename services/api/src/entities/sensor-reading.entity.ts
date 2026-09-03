import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sensor } from './sensor.entity';

@Entity('sensor_readings')
@Index(['sensor_id', 'timestamp'])
@Index(['timestamp'])
export class SensorReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sensor_id: string;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  value: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  timestamp: Date;

  @Column({ type: 'int', default: 100 })
  quality_flag: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations
  @ManyToOne(() => Sensor, (sensor) => sensor.readings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;
}
