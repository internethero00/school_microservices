import { BuyCourseSagaState } from './buy-course.state';
import { UserEntity } from '../entities/user.entity';
import { Promise } from 'mongoose';
import { CourseGetCourse, PaymentGenerateLink } from '@school/contracts';
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
