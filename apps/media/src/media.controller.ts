import { Controller, Get } from '@nestjs/common';
import { MediaService } from './media.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttactToProductDto, UploadProductImageDto } from './db/media.dto';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.mediaService.ping();
  }

  @MessagePattern('media.uploadProductImage')
  uploadProductImage(@Payload() payload: UploadProductImageDto) {
    return this.mediaService.uploadProductImage(payload)
  }

  @MessagePattern('media.attachToProduct')
  attachToProduct(@Payload() payload: AttactToProductDto) {
    return this.mediaService.attachToProduct(payload)
  }
}
