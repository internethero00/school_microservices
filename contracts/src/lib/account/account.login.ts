import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export namespace AccountLogin {
  export const topic = 'account.login.command';
  export class Request {
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;
    @IsString({ message: 'Password is required' })
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;
  }
  export class Response {
    access_token!: string;
  }
}
