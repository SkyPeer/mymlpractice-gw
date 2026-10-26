import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// What a user may change about themselves. No role here on purpose — the
// whitelisting ValidationPipe drops it from the payload, so self promotion
// is impossible even if the field is sent.
export class UpdateProfileDto {
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
}
