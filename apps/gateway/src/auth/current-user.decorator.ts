import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserContext } from "./auth.types";

export const CurrentUser = createParamDecorator(
    (_:unknown, ctx: ExecutionContext) => {         // ctx → the execution context, gives access to the request/response
        const req = ctx.switchToHttp().getRequest() as any;
        
        return req.user as UserContext | undefined
    }
)