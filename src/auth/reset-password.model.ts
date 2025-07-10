import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import { Users } from "src/user/user.model";

interface ResetPasswordCreationAttrs {
    user_id: string,
    resetToken: string,
    expiresAt: Date
}

@Table({tableName: "reset_password"})
export class ResetPassword extends Model<ResetPassword, ResetPasswordCreationAttrs> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column({type: DataType.INTEGER})
    id: string

    @AllowNull(false)
    @Column({type: DataType.STRING})
    resetToken: string

    @ForeignKey(() => Users)
    @Column({type: DataType.UUID})
    user_id: string

    @AllowNull(false)
    @Column({type: DataType.DATE})
    expiresAt: Date

    @BelongsTo(() => Users)
    user: Users
}