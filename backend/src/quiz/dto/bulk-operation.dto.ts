import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum BulkOperationType {
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  UNARCHIVE = 'UNARCHIVE',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
}

export class BulkOperationDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  quizIds: string[];

  @IsEnum(BulkOperationType)
  operation: BulkOperationType;
}
