import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) recipient_id: string;
  @Column({ length: 500 }) title: string;
  @Column({ type: 'text' }) message: string;
  @Column({ length: 100, default: 'INFO' }) type: string;
  @Column({ length: 50, default: 'NORMAL' }) priority: string;
  @Column({ default: false }) is_read: boolean;
  @Column({ type: 'timestamp with time zone', nullable: true }) read_at: Date;
  @CreateDateColumn({ type: 'timestamp with time zone' }) created_at: Date;
}
