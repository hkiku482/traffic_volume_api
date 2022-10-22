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
          process.env.ORIGIN,
        ],
      },
    },
  );

  await app.listen(3000);
}
bootstrap();
