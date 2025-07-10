import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Users } from './user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleModule } from 'src/role/role.module';
import { NewEmails } from 'src/auth/newEmails.model';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [
    SequelizeModule.forFeature([Users, NewEmails]),
    RoleModule,
  ],
  exports: [
    UserService
  ]
})
export class UserModule {}
