import { IsEnum } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  PARTICIPANT = 'PARTICIPANT',
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Invalid role. Must be ADMIN, ORGANIZER, or PARTICIPANT' })
  role: UserRole;
}
