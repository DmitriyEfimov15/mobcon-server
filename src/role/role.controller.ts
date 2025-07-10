import { Body, Controller, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/createRoleDto.dto';

@Controller('role')
export class RoleController {

    constructor(
        private roleService: RoleService 
    ) {}

    @Post('/create')
    createRole(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.createRole(createRoleDto.value)
    }
}
