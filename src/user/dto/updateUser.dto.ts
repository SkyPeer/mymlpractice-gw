import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '@app/user/types/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  readonly username?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsNotEmpty()
  readonly password?: string;

  @IsOptional()
  @IsString()
  readonly bio?: string;

  @IsOptional()
  @IsString()
  readonly image?: string;

  // Only honoured on the admin route; editing your own profile can't change it.
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;
}
