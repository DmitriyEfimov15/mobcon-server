import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendActivationCode(email: string, code: string) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Ваш код активации`,
      html: `
                    <div style="display: flex; align-items: center; flex-direction: column; width: 100%; height: 100%">
                        <h1>Добро пожаловать!</h1>
    
                        <p>Мы рады вас, что вы становитесь пользователем продуктов MobCon!</p>
                        <div style="display: flex; align-items: center;">
                            <p>Ваш код подтверждения: </p>
                            <h2>${code}</h2>
                        </div>
                        
                        <p>Наш сайт: <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
    
                        <p>Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
                    </div>
                `,
    });
  }
  async sendResetPasswordLink(email: string, resetLink: string) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Перейдите по ссылке, чтобы сменить пароль',
      html: `
                    <div style="display: flex; align-items: center; flex-direction: column; width: 100%; height: 100%">
                        <h1>Смена пароля</h1>
    
                        <p>Для смены пароля перейдите по ссылке</p>
                        <div style="display: flex; align-items: center;">
                            <p>Ваша ссылка: </p>
                            <h2>${resetLink}</h2>
                        </div>
                        
                        <p>Наш сайт: <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
    
                        <p>Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
                    </div>
                `,
    });
  }

  async sendChangeEmail(email: string, changeLink: string) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Перейдите по ссылке, чтобы сменить почту',
      html: `
                    <div style="display: flex; align-items: center; flex-direction: column; width: 100%; height: 100%">
                        <h1>Смена почты</h1>
    
                        <p>Для смены почты перейдите по ссылке</p>
                        <div style="display: flex; align-items: center;">
                            <p>Ваша ссылка: </p>
                            <h2>${changeLink}</h2>
                        </div>
                        
                        <p>Наш сайт: <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
    
                        <p>Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
                    </div>
                `,
    });
  }
}
