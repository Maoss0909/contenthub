import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateContentDto) {
    return this.contentService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Request() req: any, @Query() query: QueryContentDto) {
    return this.contentService.findAll(req.user.userId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.contentService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: UpdateContentDto,
  ) {
    return this.contentService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    await this.contentService.delete(id, req.user.userId);
    return { message: '删除成功' };
  }
}
