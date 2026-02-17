import { IsString, IsNotEmpty } from 'class-validator';

export class StartQuizDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;
}
