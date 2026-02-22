import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { HeartsService } from './hearts.service';

@Controller('hearts')
@UseGuards(JwtAuthGuard)
export class HeartsController {
  constructor(private readonly heartsService: HeartsService) {}

  @Get()
  getHearts(@Req() req: AuthenticatedRequest) {
    return this.heartsService.getHearts(req.user.id);
  }

  @Post('spend')
  spendHeart(@Req() req: AuthenticatedRequest) {
    return this.heartsService.spendHeart(req.user.id);
  }

  @Post('refill')
  refillHeart(@Req() req: AuthenticatedRequest) {
    return this.heartsService.refillHeart(req.user.id);
  }
}
