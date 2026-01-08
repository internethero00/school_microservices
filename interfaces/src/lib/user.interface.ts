import { Types } from 'mongoose'

export enum UserRole {
  Teacher='Teacher',
  Student='Student'
}

export interface IUser {
  _id?: Types.ObjectId;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}
