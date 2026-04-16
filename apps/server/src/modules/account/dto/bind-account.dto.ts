import { IsIn } from 'class-validator';

export class BindAccountDto {
  @IsIn(['wechat', 'toutiao'], { message: 'platform must be wechat or toutiao' })
  platform!: string;
}
