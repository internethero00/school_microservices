import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccountBuyCourse,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@school/contracts';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { IUser } from '@school/interfaces';
import { RMQService } from 'nestjs-rmq';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmiiter } from './user.event-emiiter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmiiter: UserEventEmiiter,
  ) {}
  async changeProfile(
    user: Pick<IUser, 'displayName'>,
    id: string,
  ): Promise<AccountChangeProfile.Response> {
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) {
      throw new NotFoundException('User not found');
    }
    const userEntity = await new UserEntity(existedUser).updateProfile(
      user.displayName,
    );
    await this.updateUser(userEntity);
    return {};
  }

  async buyCourse(userId: string, courseId: string): Promise<AccountBuyCourse.Response> {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new NotFoundException('User not found');
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    const { user, paymentLink } = await saga.getStates().pay();
    await this.updateUser(user);
    return { paymentLink };
  }

  async checkPayment(userId: string, courseId: string): Promise<AccountCheckPayment.Response> {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new NotFoundException('User not found');
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    const { user, status } = await saga.getStates().checkPayment();
    await this.updateUser(user);
    return { status };
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventEmiiter.handle(user),
      this.userRepository.updateUser(user),
    ])
  }
}
