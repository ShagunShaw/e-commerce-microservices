import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument= HydratedDocument<User>


@Schema({timestamps: true})
export class User {
    @Prop({required: true, unique: true, index: true})
    clerkUserId: string

    @Prop({required: true, unique: true})
    email: string

    @Prop({required: true})
    name: string

    @Prop({required: true, enum: ['user', 'admin'], default: 'user'})
    role: 'user' | 'admin'
    @Prop({required: true})
    lastSeenAt: Date
}


export const UserSchema = SchemaFactory.createForClass(User)        // It converts your User class into an actual Mongoose schema that MongoDB can understand. Without this line, your User class is just a plain TypeScript class — MongoDB doesn't know anything about it.