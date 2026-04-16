import { IsString, IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class PreCheckDto {
  @IsUUID('4', { message: 'contentId 必须是有效的 UUID' })
  contentId: string;

  @IsArray({ message: 'accountIds 必须是数组' })
  @ArrayMinSize(1, { message: 'accountIds 至少需要一个账号 ID' })
  @IsUUID('4', { each: true, message: 'accountIds 中的每一项必须是有效的 UUID' })
  accountIds: string[];
}
