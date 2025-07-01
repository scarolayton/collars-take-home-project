import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

let cachedServer: any;

async function bootstrap(): Promise<any> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // Global pipes
    nestApp.useGlobalPipes(new ValidationPipe());

    // CORS
    nestApp.enableCors();

    // Swagger setup
    const config = new DocumentBuilder()
      .setTitle('Task Management API')
      .setDescription('API for managing tasks and users')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api', nestApp, document);
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const server = await bootstrap();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return server(event, context) as Promise<APIGatewayProxyResult>;
};
