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
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('question')
@UseGuards(JwtAuthGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  create(@Request() req, @Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(req.user.id, createQuestionDto);
  }

  @Post('bulk')
  bulkCreate(
    @Request() req,
    @Body() body: { quizId: string; questions: CreateQuestionDto[] },
  ) {
    return this.questionService.bulkCreate(req.user.id, body.quizId, body.questions);
  }

  @Get()
  findByQuiz(@Query('quizId') quizId: string) {
    return this.questionService.findByQuiz(quizId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.update(id, req.user.id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.questionService.remove(id, req.user.id);
  }
}
