import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
  constructor() {
    // Load environment variables from .env file
    require('dotenv').config({ path: '.env' });
  }
}
