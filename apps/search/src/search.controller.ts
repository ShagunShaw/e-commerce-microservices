import { Controller, Get } from '@nestjs/common';
import { SearchService } from './search.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ProductCreatedDto } from './events/product-events-dto';
import { SearchQueryDto } from './search/search-query.dto';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @MessagePattern('service.ping')
  ping() {
    return this.searchService.ping();
  }

  @EventPattern('product.created')
  async onProductCreated(@Payload() payload: ProductCreatedDto) {
    console.log(payload)

    await this.searchService.upsertFromCatalogEvent({
      productId: payload.productId,
      name: payload.name,
      description: payload.description,
      status: payload.status,
      price: payload.price
    })
  }

  @MessagePattern('search.query')
  async query(@Payload() payload: SearchQueryDto) {
    return this.searchService.query({
      q: payload.q,
      limit: payload.limit
    })
  }
}
