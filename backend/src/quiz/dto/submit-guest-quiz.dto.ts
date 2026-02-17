import { IsString, IsNotEmpty, IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GuestAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  answer: string;

  @IsInt()
  pointsEarned: number;
}

export class SubmitGuestQuizDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsInt()
  score: number;

  @IsInt()
  totalPoints: number;

  @IsInt()
  @IsOptional()
  timeSpent?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestAnswerDto)
  answers: GuestAnswerDto[];
}
