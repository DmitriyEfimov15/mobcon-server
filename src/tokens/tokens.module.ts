import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { RefreshTokes } from './refreshTokens.model';

@Module({
  providers: [TokensService],
  imports: [
    SequelizeModule.forFeature([RefreshTokes])
  ],
  exports: [
    TokensService
  ]
})
export class TokensModule {}
