import { BuyCourseSagaState } from './buy-course.state';
import { UserEntity } from '../entities/user.entity';
import {
  CourseGetCourse,
  PaymentCheck,
  PaymentGenerateLink,
} from '@school/contracts';
import { PurchaseState } from '@school/interfaces';

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return {user : this.saga.user}
  }

  checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('The payment process is not started yet');
  }

  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, { id: this.saga.courseId });

    if (!course) {
      throw new Error('Course not found');
    }
    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, course._id.toString());
      return { paymentLink: null, user: this.saga.user };
    }
    const {paymentLink} = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
      courseId: course._id.toString(), sum: course.price, userId: this.saga.user._id.toString()
    });
    this.saga.setState(PurchaseState.WaitingForPayment, course._id.toString());
    return { paymentLink, user: this.saga.user };
  }
}

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {
  cancel(): Promise<{ user: UserEntity }> {
    throw new Error('The payment process is already started');
  }

  public async checkPayment(): Promise<{ user: UserEntity }> {
    const {status} = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(PaymentCheck.topic, {
      courseId: this.saga.courseId, userId: this.saga.user._id.toString()
    });
    if (status === 'canceled') {
      this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
      return {user : this.saga.user}
    }
    if (status !== 'success') {
      return {user: this.saga.user}
    }
    this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
    return {user: this.saga.user}
  }

  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('The payment process is already started');
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
  cancel(): Promise<{ user: UserEntity }> {
    throw new Error('The payment process is already finished');
  }

  checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('The payment process is already finished');
  }

  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('The payment process is already finished');
  }
}

export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
  cancel(): Promise<{ user: UserEntity }> {
    throw new Error('The payment process is already canceled');
  }

  checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('The payment process is already canceled');
  }

  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
     return this.saga.getStates().pay()
  }
}
