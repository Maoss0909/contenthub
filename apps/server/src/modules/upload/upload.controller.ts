import {
  Controller,
  Post,
  Delete,
  Get,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Request() req: any,
  ) {
    return this.uploadService.uploadImage(file, req.user.userId);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadImages(
    @UploadedFiles() files: MulterFile[],
    @Request() req: any,
  ) {
    return this.uploadService.uploadImages(files, req.user.userId);
  }

  @Delete(':id')
  async deleteMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    await this.uploadService.deleteMedia(id, req.user.userId);
    return { message: '删除成功' };
  }

  @Get('list')
  async getMediaList(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.uploadService.getMediaList(req.user.userId, {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
    return {
      items: result.items,
      total: result.total,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
  }
}
