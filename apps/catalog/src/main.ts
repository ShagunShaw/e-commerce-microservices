import { NestFactory } from '@nestjs/core';
import { CatalogModule } from './catalog.module';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  process.title = 'catalog'

  const logger = new Logger('CatalogBootstrap')

  // const port= Number(process.env.CATALOG_TCP_PORT ?? 4011)

  const rmq_url= process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/'

  const queue= process.env.CATALOG_QUEUE || 'catalog_queue'

  // create a microservice instance
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogModule,
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

  await app.listen()

  logger.log(`Catalog RMQ listening on queue ${queue} via ${rmq_url}`)
}
bootstrap();
