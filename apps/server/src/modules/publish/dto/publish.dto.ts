import {
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class PlatformTarget {
  @IsUUID('4', { message: 'accountId 必须是有效的 UUID' })
  accountId: string;

  @IsOptional()
  @IsDateString({}, { message: 'scheduledAt 必须是有效的 ISO 日期字符串' })
  scheduledAt?: string;
}

export class PublishDto {
  @IsUUID('4', { message: 'contentId 必须是有效的 UUID' })
  contentId: string;

  @IsArray({ message: 'platforms 必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => PlatformTarget)
  platforms: PlatformTarget[];
}
