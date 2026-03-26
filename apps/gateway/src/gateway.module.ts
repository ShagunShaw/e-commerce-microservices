import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register(
      [
        {
          name: 'CATALOG_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [`${process.env.RABBITMQ_URL}` || 'amqp://loclhost:5672'],
            queue: `${process.env.CATALOG_QUEUE}` || 'catalog_queue',
            queueOptions: {
              durable: (process.env.PRODUCTION)?true:false
            }
          }
        },
        {
          name: 'MEDIA_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [`${process.env.RABBITMQ_URL}` || 'amqp://loclhost:5672'],
            queue: `${process.env.MEDIA_QUEUE}` || 'media_queue',
            queueOptions: {
              durable: (process.env.PRODUCTION)?true:false
            }
          }
        },
        {
          name: 'SEARCH_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [`${process.env.RABBITMQ_URL}` || 'amqp://loclhost:5672'],
            queue: `${process.env.SEARCH_QUEUE}` || 'search_queue',
            queueOptions: {
              durable: (process.env.PRODUCTION)?true:false
            }
          }
        }
      ]
    ),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
