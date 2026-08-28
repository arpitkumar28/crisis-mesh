import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('weather_observations')
export class WeatherObservation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', nullable: true }) location_id: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) temperature_celsius: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) humidity_percent: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) wind_speed_kmh: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) precipitation_mm: string;
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true }) pressure_hpa: string;
  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' }) observation_time: Date;
  @Column({ length: 100, nullable: true }) source: string;
  @CreateDateColumn({ type: 'timestamp with time zone' }) created_at: Date;
}
