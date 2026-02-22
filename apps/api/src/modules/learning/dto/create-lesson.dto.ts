import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { ExerciseType } from '@duocafe/shared';

export class CreateLessonDto {
  @IsUUID()
  path_id!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  order_index!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  granos_reward?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cerezas_reward?: number;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order_index?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  granos_reward?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cerezas_reward?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateExerciseDto {
  @IsUUID()
  lesson_id!: string;

  @IsIn(['multiple_choice', 'true_false', 'matching', 'ordering'])
  type!: ExerciseType;

  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsObject()
  options!: unknown;

  @IsObject()
  correct_answer!: unknown;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsInt()
  @Min(0)
  order_index!: number;
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  question?: string;

  @IsOptional()
  @IsObject()
  options?: unknown;

  @IsOptional()
  @IsObject()
  correct_answer?: unknown;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  order_index?: number;
}
