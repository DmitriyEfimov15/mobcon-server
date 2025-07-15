import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Projects } from './projects.model';
import { Users } from 'src/user/user.model';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Projects) private projectsRepository: typeof Projects,
    @InjectModel(Users) private userRepository: typeof Users,
  ) {}

  async getAllUserProjects(userId: string) {
    const user = await this.userRepository.findByPk(userId);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);

    const userProjects = await this.projectsRepository.findAll({
      where: { user_id: user.id },
      order: [['updatedAt', 'DESC']],
    });

    return userProjects;
  }

  async createProject(
    userId: string,
    name: string,
    description?: string,
    icon_url?: string | null,
  ) {
    const user = await this.userRepository.findByPk(userId);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);

    const existingProject = await this.projectsRepository.findOne({
      where: { name },
    });
    if (existingProject)
      throw new HttpException(
        'Проект с таким названием был создан вами ранее',
        HttpStatus.BAD_REQUEST,
      );

    const newProject = await this.projectsRepository.create({
      name,
      description,
      icon_url,
      user_id: user.id,
    });
    if (!newProject)
      throw new HttpException(
        'Не удалось создать проект, попробуйте позже',
        HttpStatus.BAD_REQUEST,
      );

    return {
      statusCode: '200',
      message: 'Проект успешно создан!',
    };
  }
  async updateProject(
    userId: string,
    projectId: string,
    name?: string,
    description?: string,
    icon_url?: string | null,
  ) {
    if (name) {
      const existingProject = await this.projectsRepository.findOne({
        where: { user_id: userId, name },
      });
      if (existingProject)
        throw new HttpException(
          'Проект с таким названием был создан вами ранее',
          HttpStatus.BAD_REQUEST,
        );
    }
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      throw new HttpException('Проект не найден', HttpStatus.NOT_FOUND);
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (icon_url) project.icon_url = icon_url;

    await project.save();

    return {
      statusCode: '200',
      message: 'Ваш проект успешно изменен',
      data: {
        project,
      },
    };
  }

  // ДОПИСАТЬ УДАЛЕНИЕ ВНУТРЕННИХ ФАЙЛОВ!!!!!!
  async deleteProject(projectId: string) {
    const project = await this.projectsRepository.findByPk(projectId);
    if (!project)
      throw new HttpException('Проект не найден', HttpStatus.NOT_FOUND);

    await project.destroy();

    return {
      statusCode: '200',
      message: 'Ваш проект успешно удален!',
    };
  }

  async getRecentUserProjects(userId: string) {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const recentProjects = await this.projectsRepository.findAll({
      where: { user_id: user.id },
      order: [['updatedAt', 'DESC']], // сначала сортируем по последнему изменению
      limit: 4,
    });

    return recentProjects;
  }
}
