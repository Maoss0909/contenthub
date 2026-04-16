import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../../common/entities/content.entity';
import { ContentMedia } from '../../common/entities/content-media.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Content, ContentMedia])],
  providers: [ContentService],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
