import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AlertsModule {}
