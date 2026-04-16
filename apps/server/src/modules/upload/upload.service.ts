import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../common/entities/media.entity';
import { MinioService } from './minio.service';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly minioService: MinioService,
  ) {}

  private validateFile(file: UploadedFile): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文件类型: ${file.mimetype}，仅支持 jpg/png/gif/webp`,
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `文件大小超过限制，最大允许 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  async uploadImage(
    file: UploadedFile,
    userId: string,
  ): Promise<Media> {
    this.validateFile(file);

    const { url, objectName } = await this.minioService.uploadFile(file);

    const media = new Media();
    media.userId = userId;
    media.filename = objectName;
    media.originalName = file.originalname;
    media.mimeType = file.mimetype;
    media.size = file.size;
    media.url = url;
    media.thumbnailUrl = url; // 简单处理，直接返回原图

    return this.mediaRepository.save(media);
  }

  async uploadImages(
    files: UploadedFile[],
    userId: string,
  ): Promise<Media[]> {
    const results: Media[] = [];
    for (const file of files) {
      const media = await this.uploadImage(file, userId);
      results.push(media);
    }
    return results;
  }

  async deleteMedia(id: string, userId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: { id, userId },
    });

    if (!media) {
      throw new NotFoundException('媒体文件不存在');
    }

    try {
      await this.minioService.deleteFile(media.filename);
    } catch (error) {
      this.logger.warn(
        `Failed to delete file from MinIO: ${media.filename}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    await this.mediaRepository.remove(media);
  }

  async getMediaList(
    userId: string,
    query: { page?: number; pageSize?: number },
  ): Promise<{ items: Media[]; total: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const [items, total] = await this.mediaRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total };
  }
}
