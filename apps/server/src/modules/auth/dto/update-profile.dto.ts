import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '用户名长度不能少于2个字符' })
  @MaxLength(50, { message: '用户名长度不能超过50个字符' })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '头像 URL 长度不能超过500个字符' })
  avatar_url?: string;
}
