import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('risk_assessments')
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @Column({ type: 'uuid', nullable: true })
  district_id: string;

  @Column({ length: 50 })
  risk_type: string; // FLOOD, HEAT, FIRE, LIGHTNING, POLLUTION, etc.

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  risk_level: string; // 0-100 scale

  @Column({ length: 20 })
  severity: string; // LOW, MODERATE, HIGH, CRITICAL

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence: string; // AI confidence percentage

  @Column({ type: 'text', nullable: true })
  factors: string; // JSON string of contributing factors

  @Column({ type: 'text', nullable: true })
  prediction: string; // AI prediction text

  @Column({ type: 'timestamp with time zone', nullable: true })
  valid_from: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  valid_until: Date;

  @Column({ length: 100, default: 'AI_MODEL' })
  source: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updated_at: Date;
}