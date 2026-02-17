import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, IsArray, ValidateIf } from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @IsOptional()
  @ValidateIf((o) => o.type === 'MULTIPLE_CHOICE')
  options?: string[]; // For MCQ: ["Option A", "Option B", "Option C", "Option D"]

  @IsString()
  @IsNotEmpty()
  correctAnswer: string; // For MCQ: "A" or "0", for True/False: "true"/"false"

  @IsInt()
  @IsOptional()
  @Min(1)
  points?: number = 1;

  @IsInt()
  @IsOptional()
  @Min(1)
  timeLimit?: number; // in seconds

  @IsInt()
  @IsOptional()
  @Min(0)
  order?: number = 0;

  @IsString()
  @IsOptional()
  explanation?: string;
}
