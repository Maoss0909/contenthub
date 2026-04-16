import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../../common/entities/media.entity';
import { UploadService } from './upload.service';
import { MinioService } from './minio.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  providers: [UploadService, MinioService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
