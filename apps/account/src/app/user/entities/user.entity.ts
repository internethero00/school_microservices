import { IUser, UserRole } from '@school/interfaces';
import { Types } from 'mongoose';
import { compare, genSalt } from 'bcryptjs';
import { hash } from 'node:crypto';

export class UserEntity implements IUser {
  constructor(user: IUser) {
      this._id = user._id;
      this.displayName = user.displayName;
      this.email = user.email;
      this.role = user.role
  }
  _id: Types.ObjectId;
  displayName: string;
  email: string;
  passwordHash: string;
  role: UserRole;

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = hash(password, salt);
    return this;
  }

  public async validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }
}
