/**
 * Database Module
 * Configures TypeORM with PostgreSQL (Neon temporary, Supabase future)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { MigrationService } from './migration.service';

// Polyfill for crypto.randomUUID() for Node.js < 19
if (!global.crypto?.randomUUID) {
  global.crypto = {} as any;
  global.crypto.randomUUID = (() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }) as any;
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.databaseUrl,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations instead
        logging: configService.isDevelopment,
        ssl: configService.isProduction ? { rejectUnauthorized: false } : false,
      }),
    }),
  ],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class DatabaseModule {}
