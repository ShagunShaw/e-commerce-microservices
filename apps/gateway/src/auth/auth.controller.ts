import { Controller, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import type { UserContext } from "./auth.types";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Get('me')
    me(@CurrentUser() user: UserContext) {      // Yha pe check kro ki pura flow ky h, kaha se @CurrentUser() user lara h, kaha se usme req.body milra h, kaise set hora and all so traceback kro pura
        return {user}
    }
}