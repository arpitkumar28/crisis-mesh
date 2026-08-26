import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { ConfigService } from '../config/config.service';

interface MqttMessage {
  topic: string;
  payload: Buffer;
  qos: number;
  retain: false;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null;
  private messageHandlers: Map<string, (message: MqttMessage) => void> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const brokerUrl = this.configService.mqttBrokerUrl;
      
      this.client = mqtt.connect(brokerUrl, {
        clientId: 'crisis-mesh-backend',
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 0, // Disable reconnection
      });

      this.client.on('connect', () => {
        this.logger.log(`✅ Connected to MQTT broker: ${brokerUrl}`);
        resolve();
      });

      this.client.on('error', (error) => {
        this.logger.warn(`⚠️  MQTT connection error: ${error.message} - continuing without MQTT`);
        // Don't reject - allow app to start without MQTT
        resolve();
      });

      this.client.on('offline', () => {
        this.logger.warn('⚠️  MQTT client offline - disabling reconnection');
        if (this.client) {
          this.client.end();
          this.client = null;
        }
      });

      this.client.on('message', (topic, payload) => {
        const message: MqttMessage = {
          topic,
          payload,
          qos: 0,
          retain: false,
        };
        
        // Find matching handler
        for (const [pattern, handler] of this.messageHandlers) {
          if (this.topicMatches(pattern, topic)) {
            try {
              handler(message);
            } catch (error) {
              this.logger.error(`Error in MQTT handler for ${pattern}: ${error.message}`);
            }
            break;
          }
        }
      });

      this.client.on('disconnect', () => {
        this.logger.warn('⚠️  Disconnected from MQTT broker');
      });

      this.client.on('reconnect', () => {
        this.logger.log('🔄 Reconnecting to MQTT broker...');
      });
    });
  }

  private async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(true, () => {
          this.logger.log('MQTT client disconnected');
          resolve();
        });
      });
    }
  }

  private topicMatches(pattern: string, topic: string): boolean {
    // Convert MQTT wildcard pattern to regex
    const regexPattern = pattern
      .replace('+', '[^/]+')
      .replace('#', '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(topic);
  }

  async subscribe(pattern: string, handler: (message: MqttMessage) => void): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.warn(`MQTT client not connected, skipping subscription to ${pattern}`);
      return;
    }

    this.messageHandlers.set(pattern, handler);
    
    // Subscribe to the pattern
    this.client.subscribe(pattern, { qos: 1 as any }, (error) => {
      if (error) {
        this.logger.error(`Failed to subscribe to ${pattern}: ${error.message}`);
        throw error;
      }
      this.logger.log(`📡 Subscribed to MQTT pattern: ${pattern}`);
    });
  }

  async publish(topic: string, payload: any, options: { qos?: 0 | 1 | 2; retain?: boolean } = {}): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.warn(`MQTT client not connected, skipping publish to ${topic}`);
      return;
    }

    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    return new Promise((resolve, reject) => {
      this.client!.publish(topic, message, { qos: (options.qos || 1) as any, retain: options.retain || false }, (error) => {
        if (error) {
          this.logger.error(`Failed to publish to ${topic}: ${error.message}`);
          reject(error);
        } else {
          this.logger.debug(`📤 Published to ${topic}: ${message}`);
          resolve();
        }
      });
    });
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}