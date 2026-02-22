import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CompleteLessonDto {
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  hearts_spent?: number;
}
