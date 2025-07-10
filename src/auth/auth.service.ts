import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from 'src/user/user.model';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { Request, Response } from 'express';
import { TokensService } from 'src/tokens/tokens.service';
import { CreateRefreshTokenDto } from 'src/tokens/dto/createRefreshTokenDto.dto';
import * as uuid from 'uuid';
import { ResetPassword } from './reset-password.model';
import { Op } from 'sequelize';
import { NewEmails } from './newEmails.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users) private usersRepository: typeof Users,
    @InjectModel(ResetPassword)
    private resetPasswordRepository: typeof ResetPassword,
    @InjectModel(NewEmails) private newEmailsRepository: typeof NewEmails,
    private userService: UserService,
    private mailService: MailService,
    private tokensService: TokensService,
  ) {}

  private getDeviceInfo(req: Request) {
    const device = Array.isArray(req.headers['user-agent'])
      ? req.headers['user-agent'][0]
      : req.headers['user-agent'] || 'Неизвестное устройство';

    return device;
  }

  async getUserFromToken(authHeader: string): Promise<Users> {
    if (!authHeader) throw new UnauthorizedException('Нет токена');

    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];

    if (!token || !bearer) {
      throw new UnauthorizedException('Неверный формат токена!');
    }

    const userData = await this.tokensService.validateAccessToken(token);
    if (!userData) {
      throw new UnauthorizedException('Неверный или просроченный токен');
    }

    const user = await this.userService.findUserById(userData.id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!');
    }

    return user;
  }

  async registration(email: string, username: string, password: string) {
    const candidate = await this.usersRepository.findOne({ where: { email } });

    if (candidate && !candidate.is_email_verified) {
      const isPasswordEquals = await bcrypt.compare(
        password,
        candidate.password,
      );
      if (!isPasswordEquals) {
        return {
          message: `Пользователь с такой почтой уже найден, введен неверный пароль!`,
          status: 1,
        };
      }

      if (candidate.activation_code) {
        await this.mailService.sendActivationCode(
          candidate.email,
          candidate.activation_code,
        );
      }

      return {
        user: {
          email: candidate.email,
          username: candidate.username,
          activation_link: candidate.activation_link,
        },
      };
    }

    if (candidate && candidate.is_email_verified) {
      throw new HttpException(
        `Пользователь с email ${email} уже существует!`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const user = await this.userService.createUser({
      password: hashPassword,
      email,
      username,
    });

    if (user.activation_code)
      await this.mailService.sendActivationCode(
        user.email,
        user.activation_code,
      );

    return {
      user: {
        email: user.email,
        username: user.username,
        activation_link: user.activation_link,
      },
    };
  }

  async verifyEmail(
    activation_code: string,
    activation_link: string,
    req: Request,
    res: Response,
  ) {
    const user =
      await this.userService.findUserByActivationLink(activation_link);
    if (!user)
      throw new HttpException('Пользователь не найден!', HttpStatus.NOT_FOUND);
    if (user.activation_code !== activation_code) {
      throw new HttpException(
        'Неверный код активации!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const device_info = this.getDeviceInfo(req);

    const tokens = await this.tokensService.generateTokes(user);
    const tokensDto: CreateRefreshTokenDto = {
      device_info,
      user_id: user.id,
      token: tokens.refreshToken,
    };

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    await this.tokensService.createRefreshToken(tokensDto);

    user.is_email_verified = true;
    user.activation_code = null;
    user.activation_link = null;

    await user.save();

    return res.json({
      accessToken: tokens.accessToken,
      user,
    });
  }

  async login(email: string, password: string, req: Request, res: Response) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        `Пользователь с почтой "${email}" не найден!`,
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordEquals = await bcrypt.compare(password, user.password);
    if (!isPasswordEquals) {
      throw new HttpException('Пароли не совпадают!', HttpStatus.BAD_REQUEST);
    }

    const device_info = await this.getDeviceInfo(req);

    const tokens = await this.tokensService.generateTokes(user);
    const tokenDto = {
      token: tokens.refreshToken,
      device_info,
      user_id: user.id,
    };

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    await this.tokensService.createRefreshToken(tokenDto);

    return res.json({
      accessToken: tokens.accessToken,
      user,
    });
  }

  async logout(authHeader: string, req: Request, res: Response) {
    const user = await this.getUserFromToken(authHeader);
    if (!user) {
      throw new HttpException('Пользователь не найден!', HttpStatus.NOT_FOUND);
    }

    const device = await this.getDeviceInfo(req);

    const logOutResult = await this.tokensService.deleteRefreshToken(
      user.id,
      device,
    );

    res.clearCookie('refreshToken');

    return res.json(logOutResult);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    const tokenFromDb = await this.tokensService.findByToken(refreshToken);
    const userData =
      await this.tokensService.validateRefreshToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new HttpException(
        'The user failed verification for refresh token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findUserById(userData.id);

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${userData.id} не найден`);
    }

    const newTokens = await this.tokensService.generateTokes(user);
    const device = await this.getDeviceInfo(req);

    await this.tokensService.saveToken(user.id, device, newTokens.refreshToken);

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    return res.json({
      accessToken: newTokens.accessToken,
      user,
    });
  }

  async requestToResetPassword(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Пользователь с почтой "${email}" не найден!`,
      );
    }

    const token = uuid.v4();
    const hashToken = await bcrypt.hash(token, 5);

    await this.resetPasswordRepository.create({
      user_id: user.id,
      resetToken: hashToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await this.mailService.sendResetPasswordLink(user.email, resetLink);

    return {
      message: 'Ссылка для сброса пароля отправлена',
    };
  }

  async resetPassword(newPassword: string, token: string) {
    const allEntries = await this.resetPasswordRepository.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!allEntries) {
      throw new NotFoundException('Токены не найдены');
    }

    let matchedEntry: any = null;

    for (const entry of allEntries) {
      const isMatch = await bcrypt.compare(token, entry.resetToken);
      if (isMatch) {
        matchedEntry = entry;
        break;
      }
    }

    if (!matchedEntry) {
      throw new BadRequestException('Недействительный или истёкший токен');
    }

    const user = await this.userService.findUserById(matchedEntry.user_id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!');
    }

    user.password = await bcrypt.hash(newPassword, 5);
    await user.save();

    await this.resetPasswordRepository.destroy({ where: { user_id: user.id } });

    await this.tokensService.deleteAllRefreshTokens(user.id);

    return {
      message: 'Пароль успешно изменен!',
    };
  }

  async deleteExpiredTokens() {
    const now = new Date();

    const deletedCount = await this.resetPasswordRepository.destroy({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });

    return {
      deletedCount: deletedCount,
    };
  }

  async changeUsername(newUsername: string, password: string, userId: string) {
    const user = await this.usersRepository.findByPk(userId);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    const isPasswordEquals = await bcrypt.compare(password, user.password);
    if (!isPasswordEquals) {
      throw new HttpException('Неправильный пароль!', HttpStatus.BAD_REQUEST);
    }

    user.username = newUsername;
    await user.save();
    return {
      username: user.username,
    };
  }

  async changeEmailRequest(newEmail: string, password: string, userId: string) {
    const user = await this.usersRepository.findByPk(userId);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    const isPasswordEquals = await bcrypt.compare(password, user.password);
    if (!isPasswordEquals) {
      throw new HttpException('Неправильный пароль!', HttpStatus.BAD_REQUEST);
    }

    const isHasThisNewEmail = await this.newEmailsRepository.findOne({
      where: { new_email: newEmail },
    });
    const isHasThisEmail = await this.usersRepository.findOne({
      where: { email: newEmail },
    });
    if (isHasThisNewEmail || isHasThisEmail) {
      throw new HttpException(
        'Пользователь с такой почтой уже существует!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const activation_code = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const activation_link = uuid.v4();
    user.activation_link = activation_link;
    user.activation_code = activation_code;
    await user.save();

    const changeEmailLink = `${process.env.CLIENT_URL}/changeEmail/${activation_link}`;
    await this.mailService.sendChangeEmail(user.email, changeEmailLink);

    await this.newEmailsRepository.create({
      new_email: newEmail,
      user_id: user.id,
    });

    return {
      stasus: 'Ok',
    };
  }

  async sendActivationCodeChangedEmail(activation_link: string) {
    const user = await this.usersRepository.findOne({
      where: { activation_link },
    });
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);

    const newEmailObj = await this.newEmailsRepository.findOne({
      where: { user_id: user.id },
    });
    if (!newEmailObj)
      throw new HttpException(
        'Ваша новая почта не найдена!',
        HttpStatus.NOT_FOUND,
      );

    if (user.activation_code) {
      await this.mailService.sendActivationCode(
        newEmailObj.new_email,
        user.activation_code,
      );
    }

    return {
      stasus: 'Ok',
    };
  }

  async verifyChangedEmail(activation_link: string, activation_code: string) {
    const user =
      await this.userService.findUserByActivationLink(activation_link);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);

    if (user.activation_code !== activation_code) {
      throw new HttpException(
        'Неверный код активации!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newEmail = await this.newEmailsRepository.findOne({
      where: { user_id: user.id },
    });

    if (!newEmail)
      throw new HttpException(
        'Ваша новая почта не найдена, повторите смену почты заново',
        HttpStatus.NOT_FOUND,
      );

    user.email = newEmail.new_email;
    user.activation_code = null
    user.activation_link = null
    await user.save();

    await newEmail.destroy();

    return {
      email: user.email,
    };
  }
  async changePassword(
    newPassword: string,
    oldPassword: string,
    userId: string,
  ) {
    const user = await this.usersRepository.findByPk(userId);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    const isPasswordEquals = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordEquals) {
      throw new HttpException('Неправильный пароль!', HttpStatus.BAD_REQUEST);
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 5);

    user.password = hashNewPassword;
    await user.save();

    return {
      status: 'Ok',
    };
  }
}
