import { IsArray, IsOptional, IsString } from 'class-validator';

export class ExportQuizzesDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  quizIds?: string[]; // If empty, export all quizzes of the organizer
}

export class ImportQuizzesDto {
  @IsString()
  backupData: string; // JSON string of quiz data
}
