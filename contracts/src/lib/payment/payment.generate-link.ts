import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export namespace PaymentGenerateLink {
  export const topic = 'payment.generate-link.command';
  export class Request {
    @IsString({ message: 'courseId is required' })
    @IsNotEmpty({ message: 'courseId is required' })
    courseId!: string;

    @IsString({ message: 'userId is required' })
    @IsNotEmpty({ message: 'userId is required' })
    userId!: string;

    @IsNumber({}, { message: 'price is required' })
    @IsNotEmpty({ message: 'price is required' })
    sum!: number;
  }
  export class Response {
    link!: string;
  }
}
