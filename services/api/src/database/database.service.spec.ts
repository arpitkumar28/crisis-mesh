/**
 * Database Connection Test
 * Tests database connectivity and basic operations
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../config/config.service';
import { MigrationService } from './migration.service';

describe('Database Connection', () => {
  let migrationService: MigrationService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MigrationService,
        {
          provide: ConfigService,
          useValue: {
            databaseUrl: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
            isDevelopment: true,
            isProduction: false,
          },
        },
      ],
    }).compile();

    migrationService = module.get<MigrationService>(MigrationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(migrationService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should have DATABASE_URL configured', () => {
    expect(configService.databaseUrl).toBeDefined();
    expect(configService.databaseUrl.length).toBeGreaterThan(0);
  });

  describe('Database Connection', () => {
    it('should connect to database when DATABASE_URL is set', async () => {
      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
        console.log('Skipping database connection test - DATABASE_URL not configured');
        return;
      }

      try {
        await migrationService.runMigrations();
        console.log('✅ Database connection successful');
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
      }
    });

    it('should handle connection failures gracefully', async () => {
      // Test with invalid connection string
      const testConfigService = {
        databaseUrl: 'postgresql://invalid:invalid@invalid-host:5432/invalid',
        isDevelopment: true,
        isProduction: false,
      };

      const testModule = await Test.createTestingModule({
        providers: [
          MigrationService,
          {
            provide: ConfigService,
            useValue: testConfigService,
          },
        ],
      }).compile();

      const testMigrationService = testModule.get<MigrationService>(MigrationService);

      await expect(testMigrationService.runMigrations()).rejects.toThrow();
    });
  });
});
