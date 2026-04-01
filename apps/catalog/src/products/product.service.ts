import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./product.schema";
import { isValidObjectId, Model } from "mongoose";
import { rpcBadRequest, rpcNotFound } from "@app/rpc";
import { ProductEventsPublisher } from "../events/product-event.publisher";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) 
        private readonly productModel: Model<ProductDocument>,

        private readonly events: ProductEventsPublisher
    ) {}

    async createNewProduct(input: {
        name: string;
        description: string;
        price: number;
        status?: string,
        imageUrl?: string;
        createdByClerkUserId: string;
    }) {

        if(!input.name || !input.description) {
            rpcBadRequest('name and description are required')
        }

        if(typeof input.price !== 'number' && Number.isNaN(input.price) || input.price < 0) {
            rpcBadRequest('price must be a valid number')
        }

        if(input.status && input.status !== 'DRAFT' && input.status !== 'ACTIVE') {
            rpcBadRequest('status must be of the two enums only')
        }

        const newlyCreatedProduct = await this.productModel.create({
            name: input.name,
            description: input.description,
            price: input.price,
            status: input.status,
            imageUrl: input.imageUrl,
            createdByClerkUserId: input.createdByClerkUserId
        })

        // emit that event after db success, and since this message is emitted as an event, we do not expect a response and thus is not creating any variable to get the response
        await this.events.productCreated({
            productId: String(newlyCreatedProduct._id),
            name: newlyCreatedProduct.name,
            description: newlyCreatedProduct.description,
            status: newlyCreatedProduct.status,
            price: newlyCreatedProduct.price,
            imageUrl: newlyCreatedProduct.imageUrl,
            createdByClerkUserId: newlyCreatedProduct.createdByClerkUserId
        })

        return newlyCreatedProduct;
    }

    async listProducts() {
        return await this.productModel.find().sort({createdAt: -1}).exec()
    }

    async getProductById(input: {id: string}) {
        if(!isValidObjectId(input.id)) {
            rpcBadRequest('Invalid product ID')
        }

        const product = await this.productModel.findById(input.id).exec()

        if(!product) {
            rpcNotFound('Product not present in DB')
        }

        return product
    }
}