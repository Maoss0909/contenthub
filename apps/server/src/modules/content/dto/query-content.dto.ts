import {
  IsOptional,
  IsNumber,
  IsString,
  IsIn,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryContentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
