import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  avatarPublicId?: string;
}
