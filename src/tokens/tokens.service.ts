import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from 'src/user/user.model';
import { RefreshTokes } from './refreshTokens.model';
import { CreateRefreshTokenDto } from './dto/createRefreshTokenDto.dto';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(RefreshTokes)
    private refreshTokenRepository: typeof RefreshTokes,
    private jwtService: JwtService,
  ) {}

  async findTokenByUserIdAndDevice(userId: string, deviceInfo: string) {
    const info = await this.refreshTokenRepository.findOne({
      where: {
        user_id: userId,
        device_info: deviceInfo,
      },
    });

    return info;
  }

  async generateTokes(user: Users) {
    const payload = {
      role_id: user.role_id,
      id: user.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.ACCESS_SECRET_KEY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.REFRESH_SECRET_KEY,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async createRefreshToken(tokensDto: CreateRefreshTokenDto) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    return await this.refreshTokenRepository.create({
      ...tokensDto,
      expires_at: expiresAt,
    });
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const userData = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_SECRET_KEY,
      });
      return userData;
    } catch (e) {
      throw new HttpException(
        'Токен не прошел проверку',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateAccessToken(accessToken: string) {
    try {
      const userData = this.jwtService.verifyAsync(accessToken, {
        secret: process.env.ACCESS_SECRET_KEY,
      });
      return userData;
    } catch (e) {
      throw new HttpException(
        'Токен не прошел проверку',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteRefreshToken(user_id: string, device_info: string) {
    const deleteResult = await this.refreshTokenRepository.destroy({
      where: {
        device_info,
        user_id,
      },
    });

    return deleteResult;
  }

  async findByToken(token: string) {
    const refreshTokentoken = await this.refreshTokenRepository.findOne({
      where: { token },
    });
    return refreshTokentoken;
  }

  async saveToken(user_id: string, device: string, newRefreshToken: string) {
    const existingToken = await this.findTokenByUserIdAndDevice(
      user_id,
      device,
    );

    if (existingToken) {
      return existingToken.update({ token: newRefreshToken });
    } else {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      return await this.refreshTokenRepository.create({
        user_id,
        device_info: device,
        token: newRefreshToken,
        expires_at: expiresAt,
      });
    }
  }

  async deleteAllRefreshTokens(userId: string) {
    return await this.refreshTokenRepository.destroy({where: {user_id: userId}})
  }
}
