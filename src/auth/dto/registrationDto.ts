import { IsEmail } from "class-validator"



export class RegistrationDto {
    @IsEmail({}, {message: 'Некорректный email'})
    email: string
    username: string
    password: string
}