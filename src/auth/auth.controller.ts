import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registrationDto';
import { VerifyEmailDto } from './dto/verifyEmailDto';
import { Request, Response } from 'express';
import { SendRequestToResetPasswordDto } from './dto/sendRequestToResetPasswordDto.dto';
import { ResetPasswordDto } from './dto/resetPasswordDto.dto';
import { LoginDto } from './dto/loginDto.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ChangeUsernameDto } from './dto/changeUserName.dto';
import { ChangeEmailRequestDto } from './dto/changeEmailRequest.dto';
import { verifyChangedEmail } from './dto/verifyChangedEmail.dto';
import { SendActivationCodeChangedEmailDto } from './dto/sendActivationCodeChangedEmail.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/registration')
  registration(@Body() registrationDto: RegistrationDto) {
    return this.authService.registration(
      registrationDto.email,
      registrationDto.username,
      registrationDto.password,
    );
  }

  @Post('/verify-email')
  verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.verifyEmail(
      verifyEmailDto.activationCode,
      verifyEmailDto.activationLink,
      req,
      res,
    );
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.login(loginDto.email, loginDto.password, req, res);
  }

  @Get('/logout')
  logout(
    @Headers('authorization') authHeader: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.logout(authHeader, req, res);
  }

  @Get('/refresh')
  refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refresh(req, res);
  }

  @Post('/send-request-to-reset-password')
  sendRequestToChangePsasword(
    @Body() sendRequestToResetPasswordDto: SendRequestToResetPasswordDto,
  ) {
    return this.authService.requestToResetPassword(
      sendRequestToResetPasswordDto.email,
    );
  }

  @Post('/reset-password/:token')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('token') token: string,
  ) {
    return this.authService.resetPassword(resetPasswordDto.newPassword, token);
  }

  @UseGuards(JwtAuthGuard)
  @Put('username')
  async changeUsername(
    @Body() changeUsernameDto: ChangeUsernameDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.authService.changeUsername(
      changeUsernameDto.username,
      changeUsernameDto.password,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-email-request')
  async changeEmailRequest(
    @Body() changeEmailRequestDto: ChangeEmailRequestDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.authService.changeEmailRequest(
      changeEmailRequestDto.email,
      changeEmailRequestDto.password,
      userId,
    );
  }

  @Post('send-activation-code-changed-email')
  async sendActivationCodeChangedEmail(
    @Body()
    sendActivationCodeChangedEmailDto: SendActivationCodeChangedEmailDto,
  ) {
    return this.authService.sendActivationCodeChangedEmail(
      sendActivationCodeChangedEmailDto.activation_link,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-changed-email')
  async verifyChangedEmail(@Body() verifyChangedEmail: verifyChangedEmail) {
    return this.authService.verifyChangedEmail(
      verifyChangedEmail.activation_link,
      verifyChangedEmail.activation_code,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.authService.changePassword(
      changePasswordDto.new_password,
      changePasswordDto.old_password,
      userId,
    );
  }
}
