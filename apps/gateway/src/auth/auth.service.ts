import { Injectable, UnauthorizedException } from "@nestjs/common";
import { createClerkClient, verifyToken } from "@clerk/backend"
import dotenv from "dotenv"
import { UserContext } from "./auth.types";

dotenv.config()

@Injectable()
export class AuthService {
    private readonly clerk= createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY
    })

    private jwtVerifyOptions(): Record<string, any> {       // Record<string, any> is nothing but a TypeScript type that means — an object where: keys are string and values can be of any type
        return {
            secretKey: process.env.CLERK_SECRET_KEY
        }
    }

    async verifyAndBuildContext(token: string): Promise<UserContext>        // The return-type of this promise is 'UserContext'
    {
        try{
            const verified: any= await verifyToken(token, this.jwtVerifyOptions())

            // decoded payload
            const payload= verified?.payload ?? verified

            // clerk user id
            const clerkUserId= payload?.sub ?? payload?.userId

            if(!clerkUserId) {
                throw new UnauthorizedException('Token is missing user id')
            }

            const role : 'user' | 'admin' = 'user';

            const emailFromToken = payload?.email ?? ''

            const nameFromToken= payload?.name ?? ''

            if(emailFromToken && nameFromToken)
            {
                return {
                    clerkUserId,
                    email: emailFromToken,
                    name: nameFromToken,
                    role
                }
            }

            // If name and email are not configured in token as payload, then we will use 'clerk' cleint to fetch it 

            const user= await this.clerk.users.getUser(clerkUserId)         // 'users' and 'getUser()' are inbuilt in clerk, we have more functions like this in 'clerk.users' like 'getUser()', 'getUserList()', deleteUser(), etc.

            const primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? ''

            const fullName= [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'not present'

            return {
                clerkUserId,
                email: emailFromToken || primaryEmail,
                name: nameFromToken || fullName,
                role
            }

        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token')
        }
    }
}