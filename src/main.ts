import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:8080',
          'https://ec2-53-24-28-12.ap-northeast-1.compute.amazonaws.com',
        ],
      },
    },
  );

  await app.listen(3000);
}
bootstrap();
