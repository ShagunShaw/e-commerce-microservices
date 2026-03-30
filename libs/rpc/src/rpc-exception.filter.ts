import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";
import { Response } from "express";
import { Observable } from "rxjs";
import { RpcErrorPayload } from "./rpc.types";

@Catch()
export class RpcAllExceptionFilter extends BaseRpcExceptionFilter{
    catch(exception: any, host: ArgumentsHost) {
        if(exception instanceof RpcException)
        {
            return super.catch(exception, host)
        }

        // Handling the VALIDATION_ERROR part here, which we had not covered in the rpc.helpers.ts file
        const status= exception?.getStatus?.()
        const ctx= host.switchToHttp();
        const response= ctx.getResponse<Response>()

        if(status === 400)
        {
            const payload: RpcErrorPayload = {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: response
            }

            return super.catch(new RpcException(payload), host)
        }

        // Now to handle the errors other than the errors defined in rpc.helpers.ts
        const payload: RpcErrorPayload = {
            code: 'INTERNAL',
            message: 'Internal Error'
        }

        return super.catch(new RpcException(payload), host)
    }
}