import { Module } from '@nestjs/common';
import { HeartsController } from './hearts.controller';
import { HeartsService } from './hearts.service';

@Module({
  controllers: [HeartsController],
  providers: [HeartsService],
  exports: [HeartsService],
})
export class HeartsModule {}
