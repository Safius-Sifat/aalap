import { IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'phone must be a valid international number' })
  phone!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
