import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContentDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  @MaxLength(500, { message: '标题长度不能超过500个字符' })
  title: string;

  @IsNotEmpty({ message: '内容不能为空' })
  @IsString()
  contentHtml: string;

  @IsOptional()
  @IsObject()
  contentJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
