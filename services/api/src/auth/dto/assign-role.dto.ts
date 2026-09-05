import { IsEnum, IsUUID } from 'class-validator';
import { UserRoleEnum } from '../../entities/profile.entity';

export class AssignRoleDto {
  @IsUUID()
  userId: string;

  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
