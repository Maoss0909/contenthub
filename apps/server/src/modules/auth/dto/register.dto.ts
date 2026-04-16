import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: '密码必须至少包含字母和数字',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: '用户名长度不能少于2个字符' })
  @MaxLength(50, { message: '用户名长度不能超过50个字符' })
  username: string;
}
