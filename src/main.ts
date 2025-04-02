import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { TransformResInterceptor } from './common/interceptors';
import { appMiddleware } from './middlewares';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors();

  // use global validation pipe to validate DTOs in the controllers
  app.useGlobalPipes(
    new ValidationPipe({
      // only allow properties that are defined in the DTO
      whitelist: true,

      // transform the DTO properties to the correct type
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformResInterceptor());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Tasks App')
    .setDescription('Nest js REST API App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // enable to persist authorization token
    },
  });

  // use global prefix for all routes
  app.setGlobalPrefix(process.env.PREFIX ?? '');

  // middleware to redirect from '/' to '/docs/
  app.use(appMiddleware);

  await app.listen(process.env.PORT ?? 3000);
}

// run the app
bootstrap().catch(() => {});
