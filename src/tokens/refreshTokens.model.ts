import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, PrimaryKey, Table, Model } from "sequelize-typescript";
import { Users } from "src/user/user.model";

interface RefreshTokesCreationAttr {

}

@Table({tableName: 'refresh_tokens'})
export class RefreshTokes extends Model<RefreshTokes, RefreshTokesCreationAttr> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({type: DataType.UUID})
    id: string

    @AllowNull(false)
    @Column({type: DataType.STRING})
    token: string

    @Column({type: DataType.STRING})
    device_info: string

    @AllowNull(false)
    @Column({type: DataType.DATE})
    expires_at: Date

    @ForeignKey(() => Users)
    @Column({type: DataType.UUID})
    user_id: string

    @BelongsTo(() => Users)
    user: Users
}