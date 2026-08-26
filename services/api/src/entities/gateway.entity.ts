import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { Device } from './device.entity';

@Entity('gateways')
export class Gateway {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mesh_id: string;

  @Column({ type: 'uuid', nullable: true })
  parent_gateway_id: string;

  @Column({ type: 'int', nullable: true })
  range_meters: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Device, (device) => device.gateways, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ManyToOne(() => Gateway, (gateway) => gateway.child_gateways, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_gateway_id' })
  parent_gateway: Gateway;

  @OneToMany(() => Gateway, (gateway) => gateway.parent_gateway)
  child_gateways: Gateway[];
}
