import { IsNotEmpty, IsString } from 'class-validator';

export namespace PaymentCheck{
  export const topic = 'payment.check.query';
  export class Request {
    @IsString({ message: 'courseId is required' })
    @IsNotEmpty({ message: 'courseId is required' })
    courseId!: string;

    @IsString({ message: 'userId is required' })
    @IsNotEmpty({ message: 'userId is required' })
    userId!: string;

  }
  export class Response {
    status!: 'canceled' | 'success' | 'progress';
  }
}
