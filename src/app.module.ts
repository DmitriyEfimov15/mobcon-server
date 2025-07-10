import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { Users } from './user/user.model';
import { Role } from './role/role.model';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { TokensModule } from './tokens/tokens.module';
import { RefreshTokes } from './tokens/refreshTokens.model';
import { ResetPassword } from './auth/reset-password.model';
import { ProjectsModule } from './projects/projects.module';
import { Projects } from './projects/projects.model';
import { NewEmails } from './auth/newEmails.model';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.MODE}.env`
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'mobcon',
      models: [Users, Role, RefreshTokes, ResetPassword, Projects, NewEmails],
      autoLoadModels: true,
    }),
    UserModule,
    RoleModule,
    AuthModule,
    MailModule,
    TokensModule,
    ProjectsModule,
    ScheduleModule.forRoot(),
    CronModule,
  ],
})
export class AppModule {}
