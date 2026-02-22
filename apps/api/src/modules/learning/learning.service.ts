import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CompleteLessonResult,
  getLevelFromGranos,
  PathWithLessons,
  LessonWithExercises,
} from '@duocafe/shared';
import { CompleteLessonDto } from './dto/complete-lesson.dto';
import { CreatePathDto, UpdatePathDto } from './dto/create-path.dto';
import {
  CreateExerciseDto,
  CreateLessonDto,
  UpdateExerciseDto,
  UpdateLessonDto,
} from './dto/create-lesson.dto';

@Injectable()
export class LearningService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  // ----------------------------------------------------------
  // Consultas de contenido
  // ----------------------------------------------------------

  async getPaths(userId: string): Promise<PathWithLessons[]> {
    const { data: paths, error: pathsError } = await this.supabase
      .from('learning_paths')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (pathsError) throw new BadRequestException(pathsError.message);
    if (!paths?.length) return [];

    const { data: lessons, error: lessonsError } = await this.supabase
      .from('lessons')
      .select('*')
      .in(
        'path_id',
        paths.map((p) => p.id),
      )
      .eq('is_active', true)
      .order('order_index');

    if (lessonsError) throw new BadRequestException(lessonsError.message);

    const { data: progress } = await this.supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId);

    const progressMap = new Map(
      (progress ?? []).map((p) => [p.lesson_id as string, p]),
    );

    return paths.map((path) => ({
      ...path,
      lessons: (lessons ?? [])
        .filter((l) => l.path_id === path.id)
        .map((l) => ({
          ...l,
          progress: progressMap.get(l.id as string) ?? undefined,
        })),
    }));
  }

  async getPathById(pathId: string, userId: string): Promise<PathWithLessons> {
    const { data: path, error: pathError } = await this.supabase
      .from('learning_paths')
      .select('*')
      .eq('id', pathId)
      .eq('is_active', true)
      .single();

    if (pathError || !path) throw new NotFoundException('Ruta no encontrada');

    const { data: lessons, error: lessonsError } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('path_id', pathId)
      .eq('is_active', true)
      .order('order_index');

    if (lessonsError) throw new BadRequestException(lessonsError.message);

    const { data: progress } = await this.supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .in(
        'lesson_id',
        (lessons ?? []).map((l) => l.id),
      );

    const progressMap = new Map(
      (progress ?? []).map((p) => [p.lesson_id as string, p]),
    );

    return {
      ...path,
      lessons: (lessons ?? []).map((l) => ({
        ...l,
        progress: progressMap.get(l.id as string) ?? undefined,
      })),
    };
  }

  async getLessonById(lessonId: string): Promise<LessonWithExercises> {
    const { data: lesson, error: lessonError } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('is_active', true)
      .single();

    if (lessonError || !lesson) throw new NotFoundException('Lección no encontrada');

    const { data: exercises, error: exError } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');

    if (exError) throw new BadRequestException(exError.message);

    return { ...lesson, exercises: exercises ?? [] };
  }

  // ----------------------------------------------------------
  // Completar lección
  // ----------------------------------------------------------

  async completeLesson(
    userId: string,
    lessonId: string,
    dto: CompleteLessonDto,
  ): Promise<CompleteLessonResult> {
    // 1. Verificar lección activa
    const { data: lesson, error: lessonError } = await this.supabase
      .from('lessons')
      .select('id, granos_reward, cerezas_reward, is_active')
      .eq('id', lessonId)
      .eq('is_active', true)
      .single();

    if (lessonError || !lesson) throw new NotFoundException('Lección no encontrada');

    // 2. Verificar corazones si se gastaron
    const heartsSpent = dto.hearts_spent ?? 0;
    if (heartsSpent > 0) {
      const { data: hearts } = await this.supabase
        .from('user_hearts')
        .select('hearts_remaining')
        .eq('user_id', userId)
        .single();

      if (!hearts || (hearts.hearts_remaining as number) < heartsSpent) {
        throw new BadRequestException('No tienes suficientes corazones');
      }
    }

    // 3. Obtener perfil actual del usuario
    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('total_granos, cerezas_balance, cerezas_earned_total, level')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }

    // 4. Calcular nuevos totales
    const newTotalGranos = (profile.total_granos as number) + (lesson.granos_reward as number);
    const newCerezasBalance = (profile.cerezas_balance as number) + (lesson.cerezas_reward as number);
    const newCerezasEarnedTotal = (profile.cerezas_earned_total as number) + (lesson.cerezas_reward as number);

    // 5. Calcular nivel
    const previousLevel = getLevelFromGranos(profile.total_granos as number);
    const newLevel = getLevelFromGranos(newTotalGranos);
    const levelUp = newLevel.level > previousLevel.level;

    // 6. Actualizar perfil (todos los campos en una sola operación)
    const { error: updateError } = await this.supabase
      .from('user_profiles')
      .update({
        total_granos: newTotalGranos,
        cerezas_balance: newCerezasBalance,
        cerezas_earned_total: newCerezasEarnedTotal,
        level: newLevel.level,
        level_title: newLevel.name,
      })
      .eq('id', userId);

    if (updateError) throw new BadRequestException(updateError.message);

    // 7. Upsert progreso de lección
    await this.supabase.from('user_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: 'completed',
        score: dto.score,
        attempts: 1,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' },
    );

    // 8. Gastar corazones si aplica
    if (heartsSpent > 0) {
      await this.spendHeartsInternal(userId, heartsSpent);
    }

    return {
      granos_earned: lesson.granos_reward as number,
      cerezas_earned: lesson.cerezas_reward as number,
      new_total_granos: newTotalGranos,
      new_cerezas_balance: newCerezasBalance,
      level_up: levelUp,
      ...(levelUp && {
        new_level: newLevel.level,
        new_level_title: newLevel.name,
      }),
    };
  }

  async spendHeartsInternal(userId: string, amount: number): Promise<void> {
    const { data: hearts } = await this.supabase
      .from('user_hearts')
      .select('hearts_remaining')
      .eq('user_id', userId)
      .single();

    if (!hearts) return;

    const newRemaining = Math.max(0, (hearts.hearts_remaining as number) - amount);
    const now = new Date();
    const nextRegen =
      newRemaining < 5
        ? new Date(now.getTime() + 30 * 60 * 1000).toISOString()
        : null;

    await this.supabase
      .from('user_hearts')
      .update({
        hearts_remaining: newRemaining,
        next_regen_at: nextRegen,
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId);
  }

  // ----------------------------------------------------------
  // Admin: CRUD de contenido
  // ----------------------------------------------------------

  async createPath(dto: CreatePathDto) {
    const { data, error } = await this.supabase
      .from('learning_paths')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updatePath(pathId: string, dto: UpdatePathDto) {
    const { data, error } = await this.supabase
      .from('learning_paths')
      .update(dto)
      .eq('id', pathId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Ruta no encontrada');
    return data;
  }

  async createLesson(dto: CreateLessonDto) {
    const { data, error } = await this.supabase
      .from('lessons')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto) {
    const { data, error } = await this.supabase
      .from('lessons')
      .update(dto)
      .eq('id', lessonId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Lección no encontrada');
    return data;
  }

  async createExercise(dto: CreateExerciseDto) {
    const { data, error } = await this.supabase
      .from('exercises')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateExercise(exerciseId: string, dto: UpdateExerciseDto) {
    const { data, error } = await this.supabase
      .from('exercises')
      .update(dto)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Ejercicio no encontrado');
    return data;
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    const { error } = await this.supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) throw new BadRequestException(error.message);
  }
}
