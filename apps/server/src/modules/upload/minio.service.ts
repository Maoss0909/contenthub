import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endPoint') ?? 'localhost',
      port: this.configService.get<number>('minio.port') ?? 9000,
      accessKey: this.configService.get<string>('minio.accessKey') ?? '',
      secretKey: this.configService.get<string>('minio.secretKey') ?? '',
      useSSL: this.configService.get<boolean>('minio.useSSL') ?? false,
    });
    this.defaultBucket =
      this.configService.get<string>('minio.bucket') || 'contenthub';
  }

  async onModuleInit() {
    await this.ensureBucket(this.defaultBucket);
  }

  async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      this.logger.log(`Creating bucket: ${bucketName}`);
      await this.client.makeBucket(bucketName, 'us-east-1');
    }
  }

  async uploadFile(
    file: UploadedFile,
    bucket?: string,
  ): Promise<{ url: string; objectName: string }> {
    const targetBucket = bucket || this.defaultBucket;
    await this.ensureBucket(targetBucket);

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const ext = file.originalname.split('.').pop();
    const objectName = `${timestamp}-${randomSuffix}.${ext}`;

    await this.client.putObject(
      targetBucket,
      objectName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const url = await this.getPresignedUrl(objectName, targetBucket);

    return { url, objectName };
  }

  async deleteFile(objectName: string, bucket?: string): Promise<void> {
    const targetBucket = bucket || this.defaultBucket;
    await this.client.removeObject(targetBucket, objectName);
    this.logger.log(`Deleted file: ${objectName} from bucket: ${targetBucket}`);
  }

  async getPresignedUrl(objectName: string, bucket?: string): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    try {
      return await this.client.presignedGetObject(
        targetBucket,
        objectName,
        7 * 24 * 60 * 60,
      );
    } catch (err) {
      this.logger.error(`Failed to generate presigned URL for ${objectName}`, err);
      throw err;
    }
  }
}
