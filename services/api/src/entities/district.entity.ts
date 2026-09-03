import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 10, nullable: true })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  population: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area_sq_km: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  boundaries: string; // PostGIS geography type for district boundaries

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overall_risk_percent: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  flood_risk_percent: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  heat_risk_percent: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  fire_risk_percent: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  lightning_risk_percent: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pollution_risk_percent: string;

  @Column({ type: 'text', nullable: true })
  ai_risk_insight: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_risk_assessment: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updated_at: Date;
}
