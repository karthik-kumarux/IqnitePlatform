import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = true;

  @IsInt()
  @IsOptional()
  @Min(1)
  duration?: number; // in minutes

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  passingScore?: number; // percentage

  @IsInt()
  @IsOptional()
  @Min(1)
  maxAttempts?: number = 1;

  @IsBoolean()
  @IsOptional()
  showAnswers?: boolean = false;

  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean = false;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
