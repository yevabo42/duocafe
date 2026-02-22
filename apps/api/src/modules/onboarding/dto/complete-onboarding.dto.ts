import { IsIn, IsOptional } from 'class-validator';
import type { DailyGoal } from '@duocafe/shared';

export class CompleteOnboardingDto {
  @IsOptional()
  @IsIn(['casual', 'regular', 'intenso'])
  daily_goal?: DailyGoal;
}
