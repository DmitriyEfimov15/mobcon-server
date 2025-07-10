import { IsEmail } from "class-validator";


export class LoginDto {
    @IsEmail({}, {message: 'Некорректный email'})
    email: string
    password: string

}