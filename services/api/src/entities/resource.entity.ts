import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GeographicLocation } from './geographic-location.entity';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) name: string;
  @Column({ length: 100 }) type: string;
  @Column({ type: 'int', default: 1 }) quantity: number;
  @Column({ length: 50, nullable: true }) unit: string;
  @Column({ type: 'uuid', nullable: true }) location_id: string;
  @ManyToOne(() => GeographicLocation, { nullable: true }) @JoinColumn({ name: 'location_id' }) location: GeographicLocation;
  @Column({ length: 50, default: 'AVAILABLE' }) status: string;
  @Column({ type: 'uuid', nullable: true }) assigned_to: string;
  @CreateDateColumn({ type: 'timestamp with time zone' }) created_at: Date;
  @UpdateDateColumn({ type: 'timestamp with time zone' }) updated_at: Date;
}
