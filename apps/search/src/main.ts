import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  process.title= 'search'

  const logger= new Logger('SearchBootstrap')

  // const port= Number(process.env.SEARCH_TCP_PORT ?? 4012)

  const rmq_url= process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/'

  const queue= process.env.SEARCH_QUEUE || 'search_queue'

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SearchModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmq_url],
        queue,
        queueOptions: {
          durable: (process.env.PRODUCTION)?true:false
        },
      }
    }
  );

  app.enableShutdownHooks()
  await app.listen();

  logger.log(`Search RMQ listening on queue ${queue} via ${rmq_url}`)
}
bootstrap();
