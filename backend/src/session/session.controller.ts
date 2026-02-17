import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { StartQuizDto } from './dto/start-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('session')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('start')
  startQuiz(@Request() req, @Body() startQuizDto: StartQuizDto) {
    return this.sessionService.startQuiz(req.user.id, startQuizDto.quizId);
  }

  @Post(':sessionId/answer')
  submitAnswer(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.sessionService.submitAnswer(sessionId, req.user.id, submitAnswerDto);
  }

  @Post(':sessionId/complete')
  completeQuiz(@Request() req, @Param('sessionId') sessionId: string) {
    return this.sessionService.completeQuiz(sessionId, req.user.id);
  }

  @Get(':sessionId')
  getSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.sessionService.getSession(sessionId, req.user.id);
  }

  @Get('my/results')
  getMyResults(@Request() req) {
    return this.sessionService.getMyResults(req.user.id);
  }
}
