import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './user.model';
import { CreateUserDto } from './dto/createUserDto.dto';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(Users) private userRepository: typeof Users,
        private roleService: RoleService,
    ) {}

    async createUser(dto: CreateUserDto) {
        const role = await this.roleService.getRoleByName('USER')

        if (!role) {
            throw new HttpException("USER role not found", HttpStatus.NOT_FOUND) 
        }

        const activation_code = (Math.floor(100000 + Math.random() * 900000)).toString();

        const user = await this.userRepository.create({
            ...dto,
            activation_code,
            role_id: role.id
        })

        return user;
    }

    async findUserByActivationLink(activation_link: string) {
        const user = await this.userRepository.findOne({where: {activation_link}})
        return user;
    }

    async findUserByEmail(email :string) {
        const user = await this.userRepository.findOne({where: {email}})
        return user;
    }

    async findUserById(userId: string) {
        const user = await this.userRepository.findByPk(userId)
        return user
    } 
}
