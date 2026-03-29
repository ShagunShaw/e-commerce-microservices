import { Module } from "@nestjs/common";
import { UsersModule } from "../users/user.module";
import { AuthService } from "./auth.service";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth-guard";

@Module({
    imports: [UsersModule],
    providers: [
        AuthService,
        {       // Configurig our JWT Auth globally
            provide: APP_GUARD,
            useClass : JwtAuthGuard
        }
    ],
    exports: [AuthService]
})

export class AuthModule {}