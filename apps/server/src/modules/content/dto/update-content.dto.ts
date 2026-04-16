import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';

export class UpdateContentDto extends PartialType(
  OmitType(CreateContentDto, [] as const),
) {}
