import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get apiPort(): number {
    return parseInt(process.env.API_PORT || '3001', 10);
  }

  get apiHost(): string {
    return process.env.API_HOST || '0.0.0.0';
  }

  get corsOrigin(): string[] {
    return (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
  }

  get databaseUrl(): string {
    return process.env.DATABASE_URL || '';
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'dev-secret-key';
  }

  get mqttBrokerUrl(): string {
    return process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  }

  get supabaseUrl(): string {
    return process.env.SUPABASE_URL || '';
  }

  get supabaseAnonKey(): string {
    return process.env.SUPABASE_ANON_KEY || '';
  }

  get supabaseServiceRoleKey(): string {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
}
