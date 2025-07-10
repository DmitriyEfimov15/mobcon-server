import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { NewEmails } from 'src/auth/newEmails.model';
import { Users } from 'src/user/user.model';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectModel(Users)
    private readonly userRepository: typeof Users,
    @InjectModel(NewEmails)
    private readonly newEmailsRepository: typeof NewEmails,
  ) {}

  // Запускается каждый день в полночь
  @Cron('0 0 * * *') // CRON-синтаксис: Минуты Часы День Месяц ДеньНедели
  async deleteUsersCron() {
    this.logger.log(
      'Начат обход пользователей с неподтвержденной почтой в полночь',
    );

    const users = await this.userRepository.findAll({
      where: {
        is_email_verified: false,
        createdAt: {
          [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    for (const user of users) {
      this.logger.log(`Обрабатывается пользователь: ${user.email}`);
      const newEmailsUser = await this.newEmailsRepository.findAll({
        where: { user_id: user.id },
      });
      for (const userEmails of newEmailsUser) {
        await userEmails.destroy();
      }
      await user.destroy();
    }

    this.logger.log(`Обработка завершена, найдено: ${users.length}`);
  }

  @Cron('0 1 * * *')
  async usersWithNewEmails() {
    this.logger.log('Начат обход пользователей с новой почтой в полночь');

    const users = await this.userRepository.findAll({
      where: {
        is_email_verified: true,
        activation_link: {
          [Op.not]: null,
        },
        activation_code: {
          [Op.not]: null,
        },
      },
    });

    this.logger.log(`Найдено пользователей для очистки: ${users.length}`);

    for (const user of users) {
      user.activation_link = null;
      user.activation_code = null;
      const newEmailsUser = await this.newEmailsRepository.findAll({
        where: { user_id: user.id },
      });
      for (const userEmails of newEmailsUser) {
        await userEmails.destroy();
      }
      await user.save(); // можно заменить на bulkUpdate для оптимизации
    }

    this.logger.log('Очистка завершена');
  }
}
