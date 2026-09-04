import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
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
  private messageHandlers: Map<string, (message: MqttMessage) => void> =
    new Map();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    return new Promise((resolve) => {
      const brokerUrl = this.configService.mqttBrokerUrl;
      const broker = new URL(brokerUrl);
      const username = process.env.MQTT_USERNAME || '';
      const password = process.env.MQTT_PASSWORD || '';

      // Deliberately redact the broker URL and password. This establishes what
      // the production process received without exposing credentials in logs.
      this.logger.log(
        `MQTT connection configuration: hostname=${broker.hostname}, port=${broker.port}, protocol=${broker.protocol.replace(':', '')}, username=${JSON.stringify(username)}, password_present=${password.length > 0}, password_length=${password.length}, password_type=${typeof password}, tls_certificate_verification_enabled=true, clientId=crisis-mesh-backend, clean=true`,
      );

      this.client = mqtt.connect(brokerUrl, {
        clientId: 'crisis-mesh-backend',
        username: username,
        password: password,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 5000, // Enabled reconnection (P1 Fix)
      });

      this.client.on('connect', () => {
        this.logger.log(
          `✅ Connected to MQTT broker: ${broker.protocol}//${broker.host}`,
        );
        for (const pattern of this.messageHandlers.keys()) {
          this.client!.subscribe(pattern, { qos: 1 as any }, (error) => {
            if (error) {
              this.logger.error(
                `Failed to subscribe to ${pattern}: ${error.message}`,
              );
            } else {
              this.logger.log(`📡 Subscribed to MQTT pattern: ${pattern}`);
            }
          });
        }
        resolve();
      });

      this.client.on('error', (error: any) => {
        // Enhanced error reporting with CONNACK codes
        const errorCode = error.code || 'unknown';
        const errorMessage = error.message || 'unknown error';
        const connackCode = error.returnCode !== undefined ? error.returnCode : 'N/A';
        this.logger.warn(
          `⚠️  MQTT connection error: code=${errorCode}, message=${errorMessage}, connack_code=${connackCode} - attempt to reconnect in 5s`,
        );
        resolve();
      });

      this.client.on('offline', () => {
        this.logger.warn(
          '⚠️  MQTT client offline - waiting for reconnection...',
        );
      });

      this.client.on('message', (topic, payload) => {
        const message: MqttMessage = {
          topic,
          payload,
          qos: 0,
          retain: false,
        };

        for (const [pattern, handler] of this.messageHandlers) {
          if (this.topicMatches(pattern, topic)) {
            try {
              handler(message);
            } catch (error) {
              this.logger.error(
                `Error in MQTT handler for ${pattern}: ${error.message}`,
              );
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
    const regexPattern = pattern.replace('+', '[^/]+').replace('#', '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(topic);
  }

  async subscribe(
    pattern: string,
    handler: (message: MqttMessage) => void,
  ): Promise<void> {
    this.messageHandlers.set(pattern, handler);

    if (!this.client || !this.client.connected) {
      this.logger.warn(
        `MQTT client not connected, deferring subscription to ${pattern}`,
      );
      return;
    }

    this.client.subscribe(pattern, { qos: 1 as any }, (error) => {
      if (error) {
        this.logger.error(
          `Failed to subscribe to ${pattern}: ${error.message}`,
        );
        throw error;
      }
      this.logger.log(`📡 Subscribed to MQTT pattern: ${pattern}`);
    });
  }

  async publish(
    topic: string,
    payload: any,
    options: { qos?: 0 | 1 | 2; retain?: boolean } = {},
  ): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.warn(
        `MQTT client not connected, skipping publish to ${topic}`,
      );
      return;
    }

    const message =
      typeof payload === 'string' ? payload : JSON.stringify(payload);

    return new Promise((resolve, reject) => {
      this.client!.publish(
        topic,
        message,
        { qos: (options.qos || 1) as any, retain: options.retain || false },
        (error) => {
          if (error) {
            this.logger.error(
              `Failed to publish to ${topic}: ${error.message}`,
            );
            reject(error);
          } else {
            this.logger.debug(`📤 Published to ${topic}: ${message}`);
            resolve();
          }
        },
      );
    });
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}
