import { IsString, IsNotEmpty } from 'class-validator';

export class JoinQuizDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
