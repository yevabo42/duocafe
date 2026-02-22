import { Module } from '@nestjs/common';
import { LearningController, LearningAdminController } from './learning.controller';
import { LearningService } from './learning.service';

@Module({
  controllers: [LearningController, LearningAdminController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
