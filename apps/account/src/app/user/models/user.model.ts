import { Document, Types } from 'mongoose';
import {
  IUser,
  IUserCourses,
  PurchaseState,
  UserRole,
} from '@school/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserCourses extends Document implements IUserCourses {
  @Prop({ required: true, unique: true })
  courseId: string;
  @Prop({ type: String, required: true, enum: PurchaseState })
  purchaseState: PurchaseState;
}
export const UserCoursesSchema = SchemaFactory.createForClass(UserCourses);



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
  @Prop({type: [UserCoursesSchema], _id: false})
  courses: Types.Array<UserCourses>
}
export const UserSchema = SchemaFactory.createForClass(User);
