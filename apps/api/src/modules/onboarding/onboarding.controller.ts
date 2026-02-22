import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('quiz')
  getQuiz() {
    return this.onboardingService.getQuiz();
  }

  @Post('quiz/submit')
  submitQuiz(
    @Body() dto: SubmitQuizDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.onboardingService.submitQuiz(req.user.id, dto);
  }

  @Post('complete')
  completeOnboarding(
    @Body() dto: CompleteOnboardingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.onboardingService.completeOnboarding(req.user.id, dto);
  }
}
