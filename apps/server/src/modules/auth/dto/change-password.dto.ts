import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: '旧密码长度不能少于6位' })
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: '新密码长度不能少于6位' })
  newPassword: string;
}
