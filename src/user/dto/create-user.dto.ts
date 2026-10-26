import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from '@app/user/types/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;

  // Only honoured on the admin route; self registration forces UserRole.USER.
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;
}
