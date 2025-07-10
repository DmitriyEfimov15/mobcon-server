import { IsEmail } from "class-validator"


export class CreateUserDto {
    username: string
    
    @IsEmail({}, {message: 'Некорректный email'})
    email: string

    password: string
}