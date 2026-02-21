import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive: boolean;
}
