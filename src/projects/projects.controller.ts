import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/createProject.dto';
import { UpdateProjectDto } from './dto/updateProject.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAllProjects(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.projectService.getAllUserProjects(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @UseInterceptors(FileInterceptor('file'))
  async createProject(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProjectDto
  ) {
    const userId = req.user.id;
    return this.projectService.createProject(
      userId,
      body.name,
      body.description,
      file ? file.path : null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/update/:projectId')
  async updateProject(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const userId = req.user.id;
    return this.projectService.updateProject(
      userId,
      projectId,
      updateProjectDto.name,
      updateProjectDto.description,
      file ? file.path : null,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:projectId')
  async deleteProject(@Param('projectId') projectId: string) {
    return this.projectService.deleteProject(projectId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/recent')
  async getRecentUserProjects(@Req() req: RequestWithUser) {
    const userId = req.user.id
    return this.projectService.getRecentUserProjects(userId)
  }
}
