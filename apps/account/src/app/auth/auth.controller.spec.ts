import { TestingModule, Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '../configs/mongo.config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { UserModule } from '../user/user.module';
import { AuthModule } from './auth.module';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { AccountLogin, AccountRegister } from '@school/contracts';
import { join } from 'path';

const authLogin: AccountLogin.Request = {
  email: 'a@a.ru',
  password: '1111111',
};

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Test User',
};

describe('AuthController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: join(process.cwd(), '../../envs/.account.env'),
        }),
        MongooseModule.forRootAsync(getMongoConfig()),
        RMQModule.forTest({}),
        UserModule,
        AuthModule,
      ],
      controllers: [],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    userRepository = app.get<UserRepository>(UserRepository);
    rmqService = app.get(RMQService);
    await app.init();
  });

  it('Register user', async () => {
    const res = await rmqService.triggerRoute<
      AccountRegister.Request,
      AccountRegister.Response
    >(AccountRegister.topic, authRegister);
    expect(res.email).toEqual(authRegister.email);
  });

  it('Login user', async () => {
    const res = await rmqService.triggerRoute<
      AccountLogin.Request,
      AccountLogin.Response
    >(AccountLogin.topic, authLogin);
    expect(res.access_token).toBeDefined();
  });
  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    await app.close();
  })

});
