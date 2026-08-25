/**
 * Database Module
 * Configures TypeORM with PostgreSQL (Neon temporary, Supabase future)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { MigrationService } from './migration.service';

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
