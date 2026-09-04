import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MqttService } from '../mqtt/mqtt.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    api: 'healthy' | 'unhealthy';
    database: 'connected' | 'disconnected';
    mqtt: 'connected' | 'disconnected';
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly mqttService: MqttService,
  ) {}

  /**
   * Runs a real, lightweight query against the actual database
   * connection this app uses (the same DataSource TypeOrmModule wires up
   * in database.module.ts) — not a fabricated "connected" value. A
   * failed or uninitialized connection reports 'disconnected'.
   */
  private async checkDatabase(): Promise<'connected' | 'disconnected'> {
    try {
      if (!this.dataSource.isInitialized) {
        return 'disconnected';
      }
      await this.dataSource.query('SELECT 1');
      return 'connected';
    } catch (error: unknown) {
      this.logger.warn(
        `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 'disconnected';
    }
  }

  /**
   * Reports the real state of the same MqttService instance
   * TelemetryService subscribes through — not a fabricated value.
   */
  private checkMqtt(): 'connected' | 'disconnected' {
    return this.mqttService.isConnected() ? 'connected' : 'disconnected';
  }

  async getHealth(): Promise<HealthStatus> {
    const [database, mqtt] = await Promise.all([
      this.checkDatabase(),
      Promise.resolve(this.checkMqtt()),
    ]);

    return {
      status: database === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      version: '0.0.1',
      services: {
        api: 'healthy',
        database,
        mqtt,
      },
    };
  }
}
