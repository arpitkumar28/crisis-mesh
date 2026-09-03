import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AuthModule } from '../auth/auth.module';
import { CrisisMeshWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],
  providers: [CrisisMeshWebSocketGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}
