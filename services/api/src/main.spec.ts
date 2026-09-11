import { NestFactory } from '@nestjs/core';
import { MigrationService } from './database/migration.service';
import { bootstrapApp } from './main';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('main bootstrap', () => {
  it('runs database migrations before starting the API server', async () => {
    const migrationService = {
      runMigrations: jest.fn().mockResolvedValue(undefined),
    };

    const app = {
      enableCors: jest.fn(),
      use: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      useGlobalFilters: jest.fn(),
      get: jest.fn().mockImplementation((token) => {
        if (token === MigrationService) {
          return migrationService;
        }

        return undefined;
      }),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(app);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await bootstrapApp();

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(migrationService.runMigrations).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledWith(3002, '0.0.0.0');

    logSpy.mockRestore();
  });
});
