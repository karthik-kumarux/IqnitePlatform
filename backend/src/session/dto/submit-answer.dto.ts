import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsInt()
  @IsOptional()
  timeSpent?: number; // in seconds
}
