import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('news_articles')
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 500 }) title: string;
  @Column({ type: 'text', nullable: true }) summary: string;
  @Column({ type: 'text', nullable: true }) content: string;
  @Column({ length: 200, nullable: true }) source: string;
  @Column({ type: 'text', nullable: true }) published_url: string;
  @Column({ type: 'timestamp with time zone', nullable: true }) published_at: Date;
  @Column({ type: 'text', array: true, nullable: true }) tags: string[];
  @CreateDateColumn({ type: 'timestamp with time zone' }) created_at: Date;
  @UpdateDateColumn({ type: 'timestamp with time zone' }) updated_at: Date;
}
