import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { NewEmails } from 'src/auth/newEmails.model';
import { Projects } from 'src/projects/projects.model';
import { Role } from 'src/role/role.model';

interface UserCreationAttr {
  email: string;
  password: string;
  username: string;
  activation_code: string;
  role_id: string;
}

@Table({ tableName: 'users' })
export class Users extends Model<Users, UserCreationAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Unique
  @Column({ type: DataType.STRING })
  email: string;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({ type: DataType.STRING })
  username: string;

  @Column({ type: DataType.BOOLEAN })
  is_email_verified: boolean;

  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID })
  role_id: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  activation_code: string | null;

  @AllowNull(true)
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  activation_link: string | null;

  @BelongsTo(() => Role)
  role: Role;

  @HasMany(() => Projects)
  projects: Projects[];

  @HasMany(() => NewEmails)
  new_emails: NewEmails
}
