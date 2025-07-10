import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from 'src/user/user.model';
import { NewEmails } from 'src/auth/newEmails.model';

@Module({
  providers: [CronService],
  imports: [
    SequelizeModule.forFeature([Users, NewEmails])
  ]
})
export class CronModule {}
