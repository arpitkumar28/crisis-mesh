import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../auth/auth.module';
import { CrisisMeshWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [CrisisMeshWebSocketGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}