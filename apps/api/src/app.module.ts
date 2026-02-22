import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { RedisModule } from './modules/redis/redis.module';
import { LearningModule } from './modules/learning/learning.module';
import { HeartsModule } from './modules/hearts/hearts.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    RedisModule,
    HealthModule,
    LearningModule,
    HeartsModule,
    OnboardingModule,
  ],
})
export class AppModule {}
