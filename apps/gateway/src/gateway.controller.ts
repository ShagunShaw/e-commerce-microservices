import { Controller, Get, Inject } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Public } from './auth/public.decorator';

@Controller()
export class GatewayController {
  constructor(
    // private readonly gatewayService: GatewayService
    @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,
    @Inject('SEARCH_CLIENT') private readonly searchClient: ClientProxy,
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
  ) {}

  @Get('health')
  @Public()
  async health() {
    const ping= async (serviceName: string, client: ClientProxy) => {
      try {
        const result= await firstValueFrom(
          client.send('service.ping', {from: 'gateway'})      // If the service is alive it will respond, if not it will throw an error.
        )
          return {
            ok: true,
            service: serviceName,
            result
          }
      } catch (error) {
        return {
          ok: false,
          service: serviceName,
          error: error?.message  ??  "unknown error"
        }
      }
    }

    const [catalog, search, media] = await Promise.all([      // 'Promise.all()' creates a multi-thread and run all three ping functions simultaneously, but gives the response all together, if any function is done earlier, then it will wait for others to finish
      ping('catalog', this.catalogClient),
      ping('search', this.searchClient),
      ping('media', this.mediaClient),
    ])

    const ok= [catalog, search, media].every((s)=> s.ok)      // This checks if every service returned ok: true. If even one is down, ok becomes false.

    return {
      ok, 
      gateway: {
        service: 'gateway',
        now: new Date().toISOString()
      },
      services: {
        catalog,
        search,
        media
      }
    }
  }
}
