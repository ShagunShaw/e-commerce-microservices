import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { REQUIRED_ROLE_KEY } from "./admin.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,  // to read metadata from our decorators
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ) {}

    async canActivate(context: ExecutionContext) {
        // if the handler is marked as public means anyone can access this route
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if(isPublic)    return true;

        const req= context.switchToHttp().getRequest() as any;

        const authorisation= req.headers['authorization']

        if(!authorisation || typeof authorisation !== "string")
        {
            throw new UnauthorizedException("Missing authorisation header")
        }

        // extract the token
        const token= authorisation.startsWith('Bearer ')? authorisation.slice('Bearer '.length).trim() : ""

        if(!token) {
            throw new UnauthorizedException("Missing token")
        }

        // verify the token
        const identifyAuthUser= await this.authService.verifyAndBuildContext(token);

        const dbUser= await this.userService.upsertAuthUser({
            clerkUserId: identifyAuthUser.clerkUserId,
            email: identifyAuthUser.email,
            name: identifyAuthUser.name
        })

        const user= {
            ...identifyAuthUser,
            role: dbUser.role
        }

        // attach user so controllers can read it via @currentUser()
        req.user= user

        const requiredRole= this.reflector.getAllAndOverride<string>(REQUIRED_ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if(requiredRole === "admin" && user.role !== "admin") throw new ForbiddenException("Admin access required.")

        return true
    }
}