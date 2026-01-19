import { Types } from 'mongoose';

export interface ICourse {
  _id: Types.ObjectId;
  price: number;
}
