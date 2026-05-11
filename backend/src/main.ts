import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    httpsOptions:
      AppModule.ssl_certificate_path && AppModule.ssl_key_path
        ? {
            cert: readFileSync(AppModule.ssl_certificate_path),
            key: readFileSync(AppModule.ssl_key_path),
          }
        : undefined,
  });

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3001'],
    credentials: true,
  });

  // Validaciones
  app.useGlobalPipes(new ValidationPipe());

  // Doc
  const config = new DocumentBuilder()
    .setTitle('El Castillo Barracas API')
    .setDescription(
      'API de la plataforma web de El Castillo Barracas para venta de entradas, exhibicion de artistas, gestion de eventos y cobros online.',
    )
    .setBasePath('https://elcastillobarracas.com/api')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/')
    .addServer('/api')
    .addTag('auth')
    .addTag('events')
    .addTag('orders')
    .addTag('coupons')
    .addTag('payments')
    .addTag('tickets')
    .addTag('users')
    .addTag('mailer')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('documentation', app, document);

  await app.listen(AppModule.port);
}

bootstrap();

