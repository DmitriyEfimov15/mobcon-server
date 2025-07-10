import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class ResetPasswordTasks {
  constructor(private readonly authService: AuthService) {}

  // Запуск каждый день в полночь
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    this.authService.deleteExpiredTokens();
  }
}
