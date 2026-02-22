import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OnboardingQuestion, QuizSubmitResult } from '@duocafe/shared';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class OnboardingService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async getQuiz(): Promise<OnboardingQuestion[]> {
    const { data, error } = await this.supabase
      .from('onboarding_questions')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw new BadRequestException(error.message);
    return (data ?? []) as OnboardingQuestion[];
  }

  async submitQuiz(userId: string, dto: SubmitQuizDto): Promise<QuizSubmitResult> {
    // Cargar preguntas activas
    const { data: questions, error } = await this.supabase
      .from('onboarding_questions')
      .select('id, correct_option, level_points')
      .eq('is_active', true);

    if (error) throw new BadRequestException(error.message);
    if (!questions?.length) {
      throw new NotFoundException('No hay preguntas de quiz disponibles');
    }

    // Calcular puntaje
    const questionsMap = new Map(
      questions.map((q) => [q.id as string, q]),
    );

    let correctCount = 0;
    let totalPoints = 0;

    for (const answer of dto.answers) {
      const question = questionsMap.get(answer.questionId);
      if (!question) continue;

      if (answer.answer === question.correct_option) {
        correctCount++;
        totalPoints += question.level_points as number;
      }
    }

    // Determinar nivel asignado (nivel 2 si acertó todas, nivel 1 si no)
    const totalQuestions = questions.length;
    const assignedLevel = correctCount === totalQuestions ? 2 : 1;

    // Actualizar perfil: guardar nivel del quiz
    const { error: updateError } = await this.supabase
      .from('user_profiles')
      .update({ initial_quiz_level: assignedLevel })
      .eq('id', userId);

    if (updateError) throw new BadRequestException(updateError.message);

    return {
      assigned_level: assignedLevel,
      correct_count: correctCount,
      total_questions: totalQuestions,
    };
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto): Promise<void> {
    const updateData: Record<string, unknown> = {
      onboarding_completed: true,
    };

    if (dto.daily_goal) {
      updateData.daily_goal = dto.daily_goal;
    }

    const { error } = await this.supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw new BadRequestException(error.message);
  }
}
