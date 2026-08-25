import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { JwtAuthProvider } from './providers/jwt.provider';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

export const AUTH_PROVIDER = 'AUTH_PROVIDER';

@Module({
  imports: [
    PassportModule,
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
  providers: [
    AuthService,
    JwtAuthProvider,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtAuthProvider,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
