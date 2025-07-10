import { IsEmail } from "class-validator";



export class SendRequestToResetPasswordDto {
    @IsEmail({}, {message: 'Некорректный email'})
    email: string
}