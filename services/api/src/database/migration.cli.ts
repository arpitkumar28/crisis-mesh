/**
 * Migration CLI
 * Standalone script to run database migrations
 * Usage: npm run migration:run
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MigrationService } from './migration.service';

// Load .env from project root - try multiple paths
const possiblePaths = [
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env'),
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    console.log('Loading .env from:', envPath);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error('❌ .env file not found in any expected location');
  console.log('Searched paths:', possiblePaths);
  process.exit(1);
}

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    await migrationService.runMigrations();
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
