/**
 * Migration Service
 * Executes SQL migrations for database schema setup
 * Provider-neutral: works with both Neon and Supabase PostgreSQL
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly migrationsPath = path.resolve(
    __dirname,
    '../../../../supabase/migrations',
  );

  constructor(private readonly configService: ConfigService) {}

  async runMigrations(): Promise<void> {
    this.logger.log('Starting database migrations...');

    const pool = new Pool({
      connectionString: this.configService.databaseUrl,
    });

    try {
      // Test connection
      await pool.query('SELECT NOW()');
      this.logger.log('Database connection successful');

      // Get all migration files sorted by name
      const migrationFiles = this.getMigrationFiles();

      if (migrationFiles.length === 0) {
        this.logger.warn('No migration files found');
        return;
      }

      this.logger.log(`Found ${migrationFiles.length} migration files`);

      // Create migrations tracking table if it doesn't exist
      await this.createMigrationsTable(pool);

      // Run each migration
      for (const file of migrationFiles) {
        await this.runMigration(pool, file);
      }

      this.logger.log('All migrations completed successfully');
    } catch (error) {
      this.logger.error('Migration failed', error);
      throw error;
    } finally {
      await pool.end();
    }
  }

  private getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      this.logger.warn(
        `Migrations directory not found: ${this.migrationsPath}`,
      );
      return [];
    }

    const files = fs
      .readdirSync(this.migrationsPath)
      .filter((file) => file.endsWith('.sql'))
      .filter((file) => file !== 'README.md')
      .filter((file) => file !== '00_setup_initial_schema.sql')
      .sort();

    return files;
  }

  private async createMigrationsTable(pool: Pool): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await pool.query(query);
    this.logger.log('Migrations tracking table verified');
  }

  private async runMigration(pool: Pool, filename: string): Promise<void> {
    // Check if migration already executed
    const checkResult = await pool.query(
      'SELECT id FROM schema_migrations WHERE filename = $1',
      [filename],
    );

    if (checkResult.rows.length > 0) {
      this.logger.log(`Migration ${filename} already executed, skipping`);
      return;
    }

    this.logger.log(`Running migration: ${filename}`);

    const filePath = path.join(this.migrationsPath, filename);
    const migrationSql = fs.readFileSync(filePath, 'utf8');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(migrationSql);

      // Record migration as executed
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename],
      );

      await client.query('COMMIT');
      this.logger.log(`Migration ${filename} completed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Migration ${filename} failed`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getMigrationStatus(): Promise<any[]> {
    const pool = new Pool({
      connectionString: this.configService.databaseUrl,
    });

    try {
      const result = await pool.query(
        'SELECT filename, executed_at FROM schema_migrations ORDER BY executed_at',
      );
      return result.rows;
    } finally {
      await pool.end();
    }
  }
}
