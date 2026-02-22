import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LearningService } from './learning.service';
import { CompleteLessonDto } from './dto/complete-lesson.dto';
import { CreatePathDto, UpdatePathDto } from './dto/create-path.dto';
import {
  CreateExerciseDto,
  CreateLessonDto,
  UpdateExerciseDto,
  UpdateLessonDto,
} from './dto/create-lesson.dto';

// ----------------------------------------------------------
// Rutas públicas (requieren autenticación)
// ----------------------------------------------------------
@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('paths')
  getPaths(@Req() req: AuthenticatedRequest) {
    return this.learningService.getPaths(req.user.id);
  }

  @Get('paths/:id')
  getPathById(
    @Param('id', ParseUUIDPipe) pathId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.learningService.getPathById(pathId, req.user.id);
  }

  @Get('lessons/:id')
  getLessonById(@Param('id', ParseUUIDPipe) lessonId: string) {
    return this.learningService.getLessonById(lessonId);
  }

  @Post('lessons/:id/complete')
  completeLesson(
    @Param('id', ParseUUIDPipe) lessonId: string,
    @Body() dto: CompleteLessonDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.learningService.completeLesson(req.user.id, lessonId, dto);
  }
}

// ----------------------------------------------------------
// Rutas admin (platform_admin)
// ----------------------------------------------------------
@Controller('admin/learning')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_admin')
export class LearningAdminController {
  constructor(private readonly learningService: LearningService) {}

  @Post('paths')
  createPath(@Body() dto: CreatePathDto) {
    return this.learningService.createPath(dto);
  }

  @Put('paths/:id')
  updatePath(
    @Param('id', ParseUUIDPipe) pathId: string,
    @Body() dto: UpdatePathDto,
  ) {
    return this.learningService.updatePath(pathId, dto);
  }

  @Post('lessons')
  createLesson(@Body() dto: CreateLessonDto) {
    return this.learningService.createLesson(dto);
  }

  @Put('lessons/:id')
  updateLesson(
    @Param('id', ParseUUIDPipe) lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.learningService.updateLesson(lessonId, dto);
  }

  @Post('exercises')
  createExercise(@Body() dto: CreateExerciseDto) {
    return this.learningService.createExercise(dto);
  }

  @Put('exercises/:id')
  updateExercise(
    @Param('id', ParseUUIDPipe) exerciseId: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.learningService.updateExercise(exerciseId, dto);
  }

  @Delete('exercises/:id')
  deleteExercise(@Param('id', ParseUUIDPipe) exerciseId: string) {
    return this.learningService.deleteExercise(exerciseId);
  }
}
