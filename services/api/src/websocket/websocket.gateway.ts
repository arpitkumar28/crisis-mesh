import {
  WebSocketGateway as WebSocketGatewayDecorator,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebSocketService } from './websocket.service';
import { WebSocketEventType } from './dto/websocket-event.dto';

@WebSocketGatewayDecorator({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/ws',
})
export class CrisisMeshWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CrisisMeshWebSocketGateway.name);

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract JWT token from handshake
      const token = this.extractTokenFromSocket(client);
      
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided for client ${client.id}`);
        client.disconnect();
        return;
      }

      // Validate JWT token
      let userId: string | null = null;
      try {
        const payload = this.jwtService.verify(token);
        userId = payload.sub;
        this.logger.debug(`User ${userId} connected via WebSocket: ${client.id}`);
      } catch (error) {
        this.logger.warn(`Connection rejected: Invalid token for client ${client.id}`);
        client.disconnect();
        return;
      }

      // Register client
      this.webSocketService.registerClient(client.id, client, userId);

      // Send connection established event
      client.emit(WebSocketEventType.CONNECTION_ESTABLISHED, {
        client_id: client.id,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`WebSocket client connected: ${client.id} (user: ${userId})`);
    } catch (error) {
      this.logger.error(`Error handling WebSocket connection: ${error instanceof Error ? error.message : String(error)}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WebSocket client disconnected: ${client.id}`);
    this.webSocketService.unregisterClient(client.id);
  }

  @SubscribeMessage(WebSocketEventType.HEARTBEAT)
  handleHeartbeat(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    // Echo back heartbeat to keep connection alive
    client.emit(WebSocketEventType.HEARTBEAT, {
      timestamp: new Date().toISOString(),
      server_time: new Date().toISOString(),
    });
  }

  @SubscribeMessage('subscribe_events')
  handleSubscribeEvents(@ConnectedSocket() client: Socket, @MessageBody() data: { events: string[] }) {
    this.logger.debug(`Client ${client.id} subscribing to events: ${data.events.join(', ')}`);
    // Event subscription logic can be enhanced here for selective event filtering
    client.emit('subscription_confirmed', {
      events: data.events,
      timestamp: new Date().toISOString(),
    });
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from auth query parameter
    const token = client.handshake.auth.token || client.handshake.headers.authorization;
    
    if (token) {
      // Remove 'Bearer ' prefix if present
      return token.replace('Bearer ', '');
    }
    
    return null;
  }
}