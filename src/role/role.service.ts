import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './role.model';

@Injectable()
export class RoleService {

    constructor(
        @InjectModel(Role) private roleRepositoty: typeof Role
    ) {}

    async createRole(value: string) {
        const role = await this.roleRepositoty.create({value})
        return role;
    }

    async getRoleByName(value: string) {
        const role = await this.roleRepositoty.findOne({where: {value}})
        return role;
    }
}
