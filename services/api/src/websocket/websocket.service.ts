import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketEventType,
  WebSocketEvent,
  TelemetryUpdatedEvent,
  DeviceStatusChangedEvent,
  AlertCreatedEvent,
  AlertUpdatedEvent,
  IncidentCreatedEvent,
  IncidentUpdatedEvent,
} from './dto/websocket-event.dto';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private connectedClients: Map<string, any> = new Map(); // client_id -> socket
  private userSockets: Map<string, Set<string>> = new Map(); // user_id -> Set of client_ids

  constructor() {}

  registerClient(clientId: string, socket: any, userId?: string) {
    this.connectedClients.set(clientId, socket);

    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(clientId);
    }

    this.logger.debug(
      `Client registered: ${clientId}${userId ? ` for user: ${userId}` : ''}`,
    );
  }

  unregisterClient(clientId: string) {
    const socket = this.connectedClients.get(clientId);
    if (socket) {
      // Remove from user sockets mapping
      for (const [userId, clientIds] of this.userSockets.entries()) {
        if (clientIds.has(clientId)) {
          clientIds.delete(clientId);
          if (clientIds.size === 0) {
            this.userSockets.delete(userId);
          }
          break;
        }
      }

      this.connectedClients.delete(clientId);
      this.logger.debug(`Client unregistered: ${clientId}`);
    }
  }

  broadcast(event: WebSocketEvent) {
    const eventData = JSON.stringify(event);
    this.logger.debug(
      `Broadcasting event: ${event.type} to ${this.connectedClients.size} clients`,
    );

    for (const [clientId, socket] of this.connectedClients.entries()) {
      try {
        socket.emit(event.type, event.data);
      } catch (error) {
        this.logger.error(
          `Failed to send event to client ${clientId}: ${error.message}`,
        );
      }
    }
  }

  broadcastToUser(userId: string, event: WebSocketEvent) {
    const clientIds = this.userSockets.get(userId);
    if (!clientIds || clientIds.size === 0) {
      this.logger.debug(`No connected clients for user: ${userId}`);
      return;
    }

    const eventData = JSON.stringify(event);
    this.logger.debug(
      `Broadcasting event: ${event.type} to user: ${userId} (${clientIds.size} clients)`,
    );

    for (const clientId of clientIds) {
      const socket = this.connectedClients.get(clientId);
      if (socket) {
        try {
          socket.emit(event.type, event.data);
        } catch (error) {
          this.logger.error(
            `Failed to send event to client ${clientId}: ${error.message}`,
          );
        }
      }
    }
  }

  broadcastToRole(role: string, event: WebSocketEvent) {
    // This would require user role lookup - implement when needed
    this.logger.debug(
      `Broadcasting to role: ${role} - requires role integration`,
    );
  }

  // Specific event broadcast methods
  broadcastTelemetryUpdated(data: TelemetryUpdatedEvent) {
    const event: WebSocketEvent = {
      type: WebSocketEventType.TELEMETRY_UPDATED,
      data,
      timestamp: new Date().toISOString(),
    };
    this.broadcast(event);
  }

  broadcastDeviceStatusChanged(data: DeviceStatusChangedEvent) {
    const event: WebSocketEvent = {
      type: WebSocketEventType.DEVICE_STATUS_CHANGED,
      data,
      timestamp: new Date().toISOString(),
    };
    this.broadcast(event);
  }

  broadcastAlertCreated(data: AlertCreatedEvent) {
    const event: WebSocketEvent = {
      type: WebSocketEventType.ALERT_CREATED,
      data,
      timestamp: new Date().toISOString(),
    };
    this.broadcast(event);
  }

  broadcastIncidentCreated(data: IncidentCreatedEvent) {
    const event: WebSocketEvent = {
      type: WebSocketEventType.INCIDENT_CREATED,
      data,
      timestamp: new Date().toISOString(),
    };
    this.broadcast(event);
  }

  broadcastAlertUpdated(data: AlertUpdatedEvent) {
    const event: WebSocketEvent = {
      type: WebSocketEventType.ALERT_UPDATED,
      data,
      timestamp: new Date().toISOString(),
    };
    this.broadcast(event);
  }

  broadcastIncidentUpdated(data: IncidentUpdatedEvent) {
    const event: WebSocketEvent = {
      type: WebSocketEventType.INCIDENT_UPDATED,
      data,
      timestamp: new Date().toISOString(),
    };
    this.broadcast(event);
  }

  broadcastIntelligence(type: WebSocketEventType, data: any) {
    this.broadcast({ type, data, timestamp: new Date().toISOString() });
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }
}
