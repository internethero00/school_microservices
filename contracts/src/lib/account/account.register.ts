import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export namespace AccountRegister {
  export const topic = 'account.register.command';
  export class Request {
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;
    @IsString({ message: 'Password is required' })
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;
    @IsString({ message: 'Display name is required' })
    @IsOptional()
    displayName?: string;
  }
  export class Response {
    email!: string;
  }
}
