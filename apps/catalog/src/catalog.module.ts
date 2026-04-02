import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './products/product.schema';
import { ProductController } from './products/product.controller';
import { ProductService } from './products/product.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductEventsPublisher } from './events/product-event.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}/${process.env.MONGO_DB_CATALOG}`),

    MongooseModule.forFeature([{name: Product.name, schema: ProductSchema}]),

    // catalog talks directly to search via RMQ client (not via gateway)
    ClientsModule.register([
      {
        name: 'SEARCH_EVENTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? "ampq://localhost:5672"],
          queue: process.env.SEARCH_QUEUE ?? "search_queue",
          queueOptions: {durable: false}
        }
      }
    ])
  ],
  controllers: [CatalogController, ProductController],
  providers: [CatalogService, ProductService, ProductEventsPublisher],
})
export class CatalogModule {}
