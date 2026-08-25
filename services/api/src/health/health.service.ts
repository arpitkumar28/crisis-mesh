import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    api: 'healthy' | 'unhealthy';
    database?: 'connected' | 'disconnected';
    mqtt?: 'connected' | 'disconnected';
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      version: '0.0.1',
      services: {
        api: 'healthy',
        // Database and MQTT health checks can be added in Phase 2
      },
    };
  }
}
