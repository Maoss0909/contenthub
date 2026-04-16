import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublishService } from './publish.service';
import { FormatAdapterService } from './format-adapter.service';
import { PreCheckService } from './pre-check.service';
import { PublishDto } from './dto/publish.dto';
import { PreCheckDto } from './dto/pre-check.dto';
import { Content } from '../../common/entities/content.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('发布管理')
@ApiBearerAuth()
@Controller('publish')
export class PublishController {
  constructor(
    private readonly publishService: PublishService,
    private readonly formatAdapterService: FormatAdapterService,
    private readonly preCheckService: PreCheckService,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建发布任务' })
  async createPublishTask(
    @Request() req: any,
    @Body() dto: PublishDto,
  ) {
    const tasks = await this.publishService.createPublishTask(req.user.id, dto);
    return {
      message: '发布任务已创建',
      data: tasks,
    };
  }

  @Get('tasks')
  @ApiOperation({ summary: '获取发布任务列表' })
  async getTasks(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
  ) {
    const result = await this.publishService.getTasks(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
      platform,
    });
    return {
      data: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: '获取发布任务详情' })
  async getTaskById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const task = await this.publishService.getTaskById(id, req.user.id);
    return { data: task };
  }

  @Post('tasks/:id/retry')
  @ApiOperation({ summary: '重试发布任务' })
  async retryTask(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const task = await this.publishService.retryTask(id, req.user.id);
    return {
      message: '任务已重新加入发布队列',
      data: task,
    };
  }

  @Post('tasks/:id/cancel')
  @ApiOperation({ summary: '取消发布任务' })
  async cancelTask(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const task = await this.publishService.cancelTask(id, req.user.id);
    return {
      message: '任务已取消',
      data: task,
    };
  }

  @Get('preview/:platform')
  @ApiOperation({ summary: '预览适配结果' })
  async getPreview(
    @Request() req: any,
    @Param('platform') platform: string,
    @Query('contentId', ParseUUIDPipe) contentId: string,
  ) {
    const content = await this.contentRepository.findOne({
      where: { id: contentId, userId: req.user.id },
    });

    if (!content) {
      return { error: '内容不存在' };
    }

    const preview = this.formatAdapterService.getPreview(
      {
        title: content.title,
        content: content.contentHtml || '',
        coverImage: content.coverImage || undefined,
        tags: content.tags || undefined,
      },
      platform,
    );

    return {
      data: preview,
    };
  }

  @Post('pre-check')
  @ApiOperation({ summary: '发布预检查' })
  async preCheck(
    @Request() req: any,
    @Body() dto: PreCheckDto,
  ) {
    const content = await this.contentRepository.findOne({
      where: { id: dto.contentId, userId: req.user.id },
    });

    if (!content) {
      return { error: '内容不存在' };
    }

    const results = await this.preCheckService.preCheck(
      dto.contentId,
      content.title,
      content.contentHtml || '',
      dto.accountIds,
    );

    return { data: results };
  }

  @Get('history')
  @ApiOperation({ summary: '发布历史' })
  async getHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('platform') platform?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.publishService.getHistory(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      platform,
      startDate,
      endDate,
    });
    return {
      data: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
