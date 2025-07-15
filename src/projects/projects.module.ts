import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Projects } from './projects.model';
import { Users } from 'src/user/user.model';
import { TokensModule } from 'src/tokens/tokens.module';
import { MulterModule } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Module({
  providers: [ProjectsService],
  controllers: [ProjectsController],
  imports: [
    SequelizeModule.forFeature([Projects, Users]),
    TokensModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // создайте папку вручную или через код
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          callback(null, uniqueSuffix);
        },
      }),
    }),
  ]
})
export class ProjectsModule {}
