import { Body, Controller, Get, Inject, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttp } from "@app/rpc";
import { firstValueFrom } from "rxjs";
import { AdminOnly } from "../auth/admin.decorator";
import { Public } from "../auth/public.decorator";
import { FileInterceptor } from "@nestjs/platform-express";


type Product = {
    _id: string;
    nme: string;
    description: string;
    price: number;
    status: 'DRAFT' | 'ACTIVE';
    imageUrl: string | undefined;
    createdByClerkUserId: string;
}

@Controller()
export class ProductsHttpController {
    constructor(
        // gateway talks to catalog via RMQ client
        @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,

        @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy
    ) {}

    @Post('products')
    @AdminOnly()
    @UseInterceptors(       // Used for uploading files and other medias
        FileInterceptor('image', {
            limits: {
                fieldSize: 5 * 1024 * 1024
            }
        }
        )
    )      
    async createProduct(
        @CurrentUser() user: UserContext,
        @UploadedFile() file: Express.Multer.File | undefined,
        @Body() body: {
            name: string;
            description: string;
            price: number;
            status?: string;
            imageUrl?: string;
        }
    ) {
        let imageUrl: string | undefined = undefined
        let mediaId: string | undefined = undefined 

        if(file) {
            const base64= file.buffer.toString('base64');

            try {
                
                const upload= await firstValueFrom(
                    this.mediaClient.send('media.uploadProductImage', {
                        fileNamme: file.originalname,
                        mimeType: file.mimetype,
                        base64,
                        uploadByUserId: user.clerkUserId
                    })
                )

                imageUrl= upload.imageUrl;
                mediaId = upload.mediaId

            } catch (error) {
                mapRpcErrorToHttp(error)
            }
        }        

        let product : Product

        const payload = {
            name: body.name,
            description: body.description,
            price: body.price,
            status: body.status,
            imageUrl: '',
            createdByClerkUserId: user.clerkUserId
        }

        
        // RMQ request and response pattern
        try {
            product= await firstValueFrom(
                this.catalogClient.send('product.create', payload)
            )
        } catch (error) {
            mapRpcErrorToHttp(error)
        }

        if(mediaId) {
            try {

                await firstValueFrom(
                    this.mediaClient.send('media.attachToProduct', {
                        mediaId,
                        productId: String(product._id),
                        attachedByUserId: user.clerkUserId
                    })
                )
            } catch (error) {
                mapRpcErrorToHttp(error)
            }
        }

        return product;
    }

    @Get('products')
    @Public()
    async listProducts() {
        try {
            return await firstValueFrom(
                this.catalogClient.send('product.list', {})
            )
        } catch (error) {
            mapRpcErrorToHttp(error)
        }
    }

    @Get('products/:id')
    @Public()
    async getProduct(@Param('id') id: string) {
        try {
            return await firstValueFrom(
                this.catalogClient.send('product.getById', {id})
            )
        } catch (error) {
            mapRpcErrorToHttp(error)
        }
    }
}