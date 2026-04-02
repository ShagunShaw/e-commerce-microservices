import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductsHttpController } from './products/products.controller';
import { SearchHttpController } from './search/search.controller';

@Module({
  imports: [
    ConfigModule.forRoot({    // Check from GPT once, ki isko configure krne k baad hrr folder mei import dotenv ni krna hoga? as we had already did in this application
      isGlobal: true
    }),

    MongooseModule.forRoot(`${process.env.MONGO_URI}/${process.env.MONGO_DB_USERS}`),

    UsersModule,

    AuthModule,

    ClientsModule.register(
      [
        {
          name: 'CATALOG_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://loclhost:5672'],
            queue: process.env.CATALOG_QUEUE || 'catalog_queue',
            queueOptions: {
              durable: (process.env.PRODUCTION)?true:false
            }
          }
        },
        {
          name: 'MEDIA_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://loclhost:5672'],
            queue: process.env.MEDIA_QUEUE || 'media_queue',
            queueOptions: {
              durable: (process.env.PRODUCTION)?true:false
            }
          }
        },
        {
          name: 'SEARCH_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://loclhost:5672'],
            queue: process.env.SEARCH_QUEUE || 'search_queue',
            queueOptions: {
              durable: (process.env.PRODUCTION)?true:false
            }
          }
        }
      ]
    ),
  ],
  controllers: [GatewayController, ProductsHttpController, SearchHttpController],
  providers: [GatewayService],
})
export class GatewayModule {}
