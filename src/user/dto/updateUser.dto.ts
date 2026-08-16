import { IsEnum, IsOptional } from 'class-validator';
import { UpdateProfileDto } from '@app/user/dto/updateProfile.dto';
import { UserRole } from '@app/user/types/role.enum';

// Everything a user may change about themselves, plus the role — only the
// admin route accepts this one.
export class UpdateUserDto extends UpdateProfileDto {
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;
}
