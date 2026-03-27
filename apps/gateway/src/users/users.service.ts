import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./user.schema";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async upsertAuthUser(           // Upsert = Update + Insert
        input: {
            clerkUserId: string;
            email: string;
            name: string;
        }
    ) {
        const now= new Date()

        return this.userModel.findOneAndUpdate(
            {
                clerkUserId: input.clerkUserId
            },
            {
                $set: {
                    email: input.email,
                    name: input.name,
                    lastSeenAt: now
                },
                $setOnInsert: {
                    role: 'user'
                }
            },
            {
                new: true,      // create if not found
                upsert: true,       // → Tries to FIND user by clerkUserId
                                    // → FOUND? → update their email, name, lastSeenAt
                                    // → NOT FOUND? → create a brand new document with clerkUserId + all the $set fields
                setDefaultsOnInsert: true
            }
        )
    }

    async findByClerkUserId(clerkUserId: string) {
        return this.userModel.findOne({clerkUserId})
    }
}