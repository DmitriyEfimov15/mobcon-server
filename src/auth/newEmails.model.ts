import { BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { Users } from 'src/user/user.model';

interface NewEmailsCreationAttr {
    new_email: string
    user_id: string
}

@Table({ tableName: 'new_emails' })
export class NewEmails extends Model<NewEmails, NewEmailsCreationAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Unique
  @Column(DataType.STRING)
  new_email: string

  @ForeignKey(() => Users)
  @Column({type: DataType.UUID})
  user_id: string

  @BelongsTo(() => Users)
  user: Users
}
