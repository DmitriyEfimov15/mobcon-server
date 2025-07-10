import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Users } from 'src/user/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResetPassword } from './reset-password.model';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { JwtModule } from '@nestjs/jwt';
import { NewEmails } from './newEmails.model';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    SequelizeModule.forFeature([ResetPassword]),
    JwtModule.register({
      global: true,
    }),
    SequelizeModule.forFeature([Users, ResetPassword, NewEmails]),
    UserModule,
    MailModule,
    TokensModule,
  ],
})
export class AuthModule {}
