import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizDto } from './create-quiz.dto';
import { IsBoolean, IsOptional, IsEnum } from 'class-validator';

enum QuizStatus {
  DRAFT = 'DRAFT',
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(QuizStatus)
  @IsOptional()
  status?: QuizStatus;
}
