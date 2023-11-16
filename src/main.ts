import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from './app.module';
require('dotenv').config();

async function bootstrap() {
  // setLogLevel('info');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('NestApplication');

  // Prisma Exception Filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter, {
      // Prisma Error Code: HTTP Status Response
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    }),
  );

  app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

  // Compression
  app.use(compression());

  // Enable Helmet
  app.use(helmet());

  // set CORS
  app.enableCors();

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // Enable Auto Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
    }),
  );

  // Config Service
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix(configService.get('PREFIX_NAME', 'service_name'));

  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get('APP_NAME'))
    .setDescription(`The ${configService.get('APP_NAME')} API description`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocumentOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerDocumentOptions,
  );

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: `${configService.get('APP_NAME')} API Docs`,
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };

  SwaggerModule.setup(
    `${configService.get('PREFIX_NAME')}/api`,
    app,
    document,
    customOptions,
  );

  await app.listen(parseInt(configService.get('PORT', '3000'), 10));
  logger.verbose(`Application is running on: ${await app.getUrl()}`);
  logger.verbose(
    `Swagger API is running on: ${await app.getUrl()}/${configService.get(
      'PREFIX_NAME',
    )}/api`,
  );
}
bootstrap().catch((err) => {
  console.log(`Fatal error during initialization:`, err);
  process.exit(1);
});
