import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common"

// Converting our rpc error to http
export function mapRpcErrorToHttp(err: any): never{
    const payload = err?.error ?? err

    const code= payload?.code as string | undefined
    const message = payload?.message ?? "Request failed!"

    if(code === "BAD_REQUEST" || code === "VALIDATION_ERROR") {
        throw new BadRequestException(message)
    }
    
    if(code === "NOT_FOUND") {
        throw new NotFoundException(message)
    }
    
    if(code === "UNAUTHORIZED") {
        throw new UnauthorizedException(message)
    }
    
    if(code === "FORBIDDEN") {
        throw new ForbiddenException(message)
    }
    
    // For all other exceptions
    throw new InternalServerErrorException(message)
}