import {
  Controller,
  Logger,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserId } from '../guards/user.decorator';
import { RMQService } from 'nestjs-rmq';
import { AccountUserInfo } from '@school/contracts';
import { Cron } from '@nestjs/schedule';

@Controller('user')
export class UserController {
  constructor(private readonly rmqService: RMQService) {}

  @UseGuards(JWTAuthGuard)
  @Post('info')
  async info(
    @UserId() userId: string,
  ) {
    try {
      return await this.rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>(AccountUserInfo.topic, {id: userId})
    } catch (e) {
      if (e instanceof Error) throw new UnauthorizedException(e.message)
    }
  }

  @Cron('*/5 * * * * *')
  async cron() {
    Logger.log('Done');
  }

}
