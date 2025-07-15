import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Users } from 'src/user/user.model';

interface ProjectsCreationAttr {
  name: string
  description?: string
  icon_url?: string | null
  user_id: string
}

@Table({ tableName: 'projects' })
export class Projects extends Model<Projects, ProjectsCreationAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string

  @AllowNull(true)
  @Column(DataType.STRING)
  description: string

  @AllowNull(true)
  @Column(DataType.STRING)
  icon_url: string

  @Column(DataType.STRING)
  expo_project_id: string

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE })
  updated_at: Date;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE })
  created_at: Date;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID })
  user_id: string

  @BelongsTo(() => Users)
  user: Users;
}
