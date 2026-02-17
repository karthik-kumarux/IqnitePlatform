import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JoinQuizDto } from './dto/join-quiz.dto';
import { JoinLobbyDto } from './dto/join-lobby.dto';
import { SubmitGuestQuizDto } from './dto/submit-guest-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(req.user.id, createQuizDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req, @Query('myQuizzes') myQuizzes?: string, @Query('public') isPublic?: string) {
    const organizerId = myQuizzes === 'true' ? req.user.id : undefined;
    const publicFilter = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.quizService.findAll(organizerId, publicFilter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Get(':id/questions')
  async getQuestions(@Param('id') id: string) {
    // Public endpoint to get quiz questions (without correct answers for security)
    const questions = await this.quizService.getQuizQuestions(id);
    return questions;
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  joinQuiz(@Body() joinQuizDto: JoinQuizDto) {
    return this.quizService.findByCode(joinQuizDto.code);
  }

  @Post('join-public')
  joinQuizPublic(@Body() joinQuizDto: JoinQuizDto) {
    // Public endpoint - no auth required
    return this.quizService.findByCode(joinQuizDto.code);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, req.user.id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.quizService.remove(id, req.user.id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req, @Param('id') id: string) {
    return this.quizService.getQuizStatsWithGuests(id, req.user.id);
  }

  // Guest Quiz Submission
  @Post('guest/submit')
  submitGuestQuiz(@Body() submitGuestQuizDto: SubmitGuestQuizDto) {
    return this.quizService.submitGuestQuiz(submitGuestQuizDto);
  }

  // Lobby Endpoints
  @Post('lobby/join')
  joinLobby(@Body() joinLobbyDto: JoinLobbyDto) {
    return this.quizService.joinLobby(joinLobbyDto.participantName, joinLobbyDto.quizCode);
  }

  @Get(':id/lobby/participants')
  getLobbyParticipants(@Param('id') id: string) {
    return this.quizService.getLobbyParticipants(id);
  }

  @Delete('lobby/:lobbyId')
  removeLobbyParticipant(@Param('lobbyId') lobbyId: string) {
    return this.quizService.removeLobbyParticipant(lobbyId);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  startQuiz(@Request() req, @Param('id') id: string) {
    return this.quizService.startQuiz(id, req.user.id);
  }

  @Get(':id/status')
  getQuizStatus(@Param('id') id: string) {
    return this.quizService.getQuizStatus(id);
  }

  @Delete(':id/lobby/clear')
  @UseGuards(JwtAuthGuard)
  clearLobby(@Request() req, @Param('id') id: string) {
    return this.quizService.clearLobby(id);
  }
}
