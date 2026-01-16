import { IUser, IUserCourses, UserRole } from '@school/interfaces';
import { Types } from 'mongoose';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  constructor(user: IUser) {
    this._id = user._id;
    this.passwordHash = user.passwordHash;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
    this.courses = user.courses;
  }
  _id: Types.ObjectId;
  displayName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourses[];

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public async updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }
}
