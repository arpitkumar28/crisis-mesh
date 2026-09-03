import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeographicLocation } from './geographic-location.entity';

@Entity('shelters')
export class Shelter {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) name: string;
  @Column({ type: 'uuid' }) location_id: string;
  @ManyToOne(() => GeographicLocation)
  @JoinColumn({ name: 'location_id' })
  location: GeographicLocation;
  @Column({ type: 'int' }) capacity: number;
  @Column({ type: 'int', default: 0 }) current_occupancy: number;
  @Column({ length: 100, nullable: true }) type: string;
  @Column({ type: 'text', array: true, nullable: true }) facilities: string[];
  @Column({ length: 20, nullable: true }) contact_phone: string;
  @Column({ default: true }) is_operational: boolean;
  @CreateDateColumn({ type: 'timestamp with time zone' }) created_at: Date;
  @UpdateDateColumn({ type: 'timestamp with time zone' }) updated_at: Date;
}
