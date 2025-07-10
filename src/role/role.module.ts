import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './role.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
  imports: [
    SequelizeModule.forFeature([Role])
  ]
})
export class RoleModule {}
