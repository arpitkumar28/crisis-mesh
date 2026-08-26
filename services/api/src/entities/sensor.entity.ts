import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Device } from './device.entity';
import { SensorReading } from './sensor-reading.entity';

export enum SensorMetric {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  PRESSURE = 'PRESSURE',
  RAINFALL = 'RAINFALL',
  WIND_SPEED = 'WIND_SPEED',
  WATER_LEVEL = 'WATER_LEVEL',
  SEISMIC = 'SEISMIC',
  AIR_QUALITY = 'AIR_QUALITY',
}

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: SensorMetric,
    enumName: 'sensor_metric_enum',
  })
  metric: SensorMetric;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  min_value: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  max_value: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  calibration_offset: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Device, (device) => device.sensors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @OneToMany(() => SensorReading, (reading) => reading.sensor)
  readings: SensorReading[];
}
