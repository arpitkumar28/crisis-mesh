import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    // Skip validation in test environment
    if (this.nodeEnv !== 'test') {
      this.validateRequiredEnvVars();
    }
  }

  private validateRequiredEnvVars(): void {
    const requiredVars: string[] = [];

    if (!process.env.JWT_SECRET) {
      requiredVars.push('JWT_SECRET');
    }

    if (!process.env.DATABASE_URL) {
      requiredVars.push('DATABASE_URL');
    }

    if (this.isProduction && !process.env.CORS_ORIGIN) {
      requiredVars.push('CORS_ORIGIN');
    }

    if (this.isProduction && !process.env.MQTT_BROKER_URL) {
      requiredVars.push('MQTT_BROKER_URL');
    }

    if (requiredVars.length > 0) {
      this.logger.error(
        `Missing required environment variables: ${requiredVars.join(', ')}. ` +
          'Please set these variables in your .env file or environment.',
      );
      throw new Error(
        `Configuration error: Missing required environment variables: ${requiredVars.join(', ')}`,
      );
    }
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get apiPort(): number {
    return parseInt(process.env.API_PORT || '3002', 10);
  }

  get apiHost(): string {
    return process.env.API_HOST || '0.0.0.0';
  }

  get corsOrigin(): string[] {
    const configuredOrigins = process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (configuredOrigins && configuredOrigins.length > 0) {
      return configuredOrigins;
    }

    if (this.isProduction) {
      return ['https://crisis-mesh-eosin.vercel.app'];
    }

    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
  }

  get databaseUrl(): string {
    return process.env.DATABASE_URL || '';
  }

  get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  get mqttBrokerUrl(): string {
    const value = process.env.MQTT_BROKER_URL;

    if (this.isProduction && !value) {
      throw new Error(
        'MQTT_BROKER_URL environment variable is required in production',
      );
    }

    return value || 'mqtt://localhost:1883';
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

  get(key: string): string | undefined {
    return process.env[key];
  }
}
