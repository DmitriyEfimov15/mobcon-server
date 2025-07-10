import { Column, DataType, Default, HasMany, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import { Users } from "src/user/user.model";

interface RoleCreationAttr {
    value: string
}

@Table({tableName: 'role'})
export class Role extends Model<Role, RoleCreationAttr> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID })
    id: string

    @Unique
    @Column({ type: DataType.STRING })
    value: string

    @HasMany(() => Users)
    users: Users[]
}