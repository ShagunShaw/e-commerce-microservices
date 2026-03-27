import { NestFactory } from '@nestjs/core';
import { MediaModule } from './media.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  process.title = 'media';

  const logger= new Logger('MediaBootstrap')

  // const port= Number(process.env.MEDIA_TCP_PORT ?? 4013)

  const rmq_url= process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/'

  const queue= process.env.MEDIA_QUEUE || 'media_queue'

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MediaModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmq_url],
        queue,
        queueOptions: {
          durable: (process.env.PRODUCTION)?true:false 
        },
      }
    },
  );

  app.enableShutdownHooks()
  await app.listen();

  logger.log(`Media RMQ listening on queue ${queue} via ${rmq_url}`)
}
bootstrap();
