import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
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

  // La API vive bajo /api (el backend tambien sirve la SPA y /uploads en la
  // raiz). Se excluye /evento/:slug, que lo maneja OgController en la raiz para
  // que la URL compartible no lleve /api.
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'evento/:slug', method: RequestMethod.GET }],
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

  SwaggerModule.setup('api/documentation', app, document);

  await app.listen(AppModule.port);
}

bootstrap();

