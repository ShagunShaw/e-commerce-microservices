import { INestMicroservice, ValidationPipe } from "@nestjs/common";
import { RpcAllExceptionFilter } from "./rpc-exception.filter";

// It's a helper function that applies global settings to any microservice — called once in main.ts to set up two things: ValidationPipe and RpcAllExceptionFilter
export function applyToMicroservicesLayer(app: INestMicroservice) {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    )

    app.useGlobalFilters(new RpcAllExceptionFilter())
}