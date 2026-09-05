import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = new ConfigService();

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = configService.corsOrigin;
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security headers
  app.use(helmet());

  // Global validation pipe
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Strips any field marked @Exclude() (e.g. Profile.password_hash) from
  // every JSON response, including nested relations (e.g. an Alert's
  // `issuer` or an Incident's `reporter`/`assignee`) — a defense-in-depth
  // backstop against ever serializing a password hash over the wire,
  // regardless of which controller loaded the relation.
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Standardized API response/error handling (Phase 1 Foundation)
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || process.env.API_PORT || 3001;
  const host = process.env.API_HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`🚀 CrisisMesh API running on http://${host}:${port}`);
  console.log(`📍 Health check: http://${host}:${port}/api/v1/health`);
}

bootstrap();
