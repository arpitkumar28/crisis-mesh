/**
 * Bootstrap Module
 * Provides secure admin bootstrap functionality
 */
import { Module } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [BootstrapService],
  exports: [BootstrapService],
})
export class BootstrapModule {}