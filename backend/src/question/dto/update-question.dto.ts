import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateQuestionDto extends PartialType(
  OmitType(CreateQuestionDto, ['quizId'] as const),
) {}
