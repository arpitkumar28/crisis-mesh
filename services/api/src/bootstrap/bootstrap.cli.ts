/**
 * Bootstrap CLI
 * Standalone script to run one-time admin bootstrap
 * Usage: npm run bootstrap:admin
 * 
 * Security: This script requires BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD
 * environment variables to be set. If not set, it will do nothing (opt-in behavior).
 * 
 * After successful bootstrap, these environment variables should be removed/disabled
 * to prevent repeated execution.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { BootstrapService } from './bootstrap.service';

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

async function runBootstrap() {
  console.log('🚀 Starting admin bootstrap process...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const bootstrapService = app.get(BootstrapService);

  try {
    // Check if bootstrap is configured
    if (!bootstrapService.isBootstrapConfigured()) {
      console.log('ℹ️  Bootstrap not configured (BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD not set)');
      console.log('ℹ️  Bootstrap provisioning skipped - this is expected for normal operation');
      process.exit(0);
    }

    console.log('⚙️  Bootstrap credentials configured, proceeding with admin provisioning...');
    
    await bootstrapService.bootstrapAdmin();
    
    console.log('✅ Bootstrap admin provisioning completed successfully');
    console.log('');
    console.log('🔒 SECURITY REMINDER:');
    console.log('   1. Remove BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD from your environment');
    console.log('   2. Verify the admin account was created with ADMIN role');
    console.log('   3. Test the admin login before proceeding');
    console.log('   4. Do not commit bootstrap credentials to source control');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Bootstrap failed:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   - Verify BOOTSTRAP_ADMIN_EMAIL is a valid email format');
    console.error('   - Verify BOOTSTRAP_ADMIN_PASSWORD meets security requirements');
    console.error('   - (min 8 chars, uppercase, lowercase, number)');
    console.error('   - Check database connectivity');
    console.error('   - Review logs above for specific error details');
    console.error('');
    process.exit(1);
  }
}

runBootstrap();