import { IsNotEmpty, IsString } from 'class-validator';

export class JoinLobbyDto {
  @IsString()
  @IsNotEmpty()
  participantName: string;

  @IsString()
  @IsNotEmpty()
  quizCode: string;
}
