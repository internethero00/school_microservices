import { Document } from 'mongoose';
import { IUser, UserRole } from '@school/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema()
export class User extends Document implements IUser {
  @Prop()
  displayName?: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({type: String, required: true, enum: UserRole, default: UserRole.Student })
  role: UserRole;
}
export const UserSchema = SchemaFactory.createForClass(User);
