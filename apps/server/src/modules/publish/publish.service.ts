import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PublishTask, PublishTaskStatus } from '../../common/entities/publish-task.entity';
import { Content } from '../../common/entities/content.entity';
import { Account } from '../../common/entities/account.entity';
import { PublishDto } from './dto/publish.dto';
import { FormatAdapterService } from './format-adapter.service';
import { PreCheckService } from './pre-check.service';
import { PublishContent } from './adapters/publish-adapter.interface';

@Injectable()
export class PublishService {
  private readonly logger = new Logger(PublishService.name);

  constructor(
    @InjectRepository(PublishTask)
    private readonly publishTaskRepository: Repository<PublishTask>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectQueue('publish_queue')
    private readonly publishQueue: Queue,
    private readonly formatAdapterService: FormatAdapterService,
    private readonly preCheckService: PreCheckService,
  ) {}

  /**
   * 创建发布任务
   */
  async createPublishTask(
    userId: string,
    dto: PublishDto,
  ): Promise<PublishTask[]> {
    // 查询内容
    const content = await this.contentRepository.findOne({
      where: { id: dto.contentId, userId },
    });

    if (!content) {
      throw new NotFoundException('内容不存在');
    }

    const accountIds = dto.platforms.map((p) => p.accountId);

    // 执行预检查
    const preCheckResults = await this.preCheckService.preCheck(
      dto.contentId,
      content.title,
      content.contentHtml || '',
      accountIds,
    );

    // 检查是否有未通过预检的
    const failedChecks = preCheckResults.filter((r) => !r.passed);
    if (failedChecks.length > 0) {
      const messages = failedChecks
        .map(
          (r) =>
            `账号 ${r.accountId} (${r.platform}): ${Object.entries(r.checks)
              .filter(([, v]) => !v.passed)
              .map(([, v]) => v.message)
              .join(', ')}`,
        )
        .join('; ');
      throw new BadRequestException(`预检查未通过: ${messages}`);
    }

    const tasks: PublishTask[] = [];

    for (const platformTarget of dto.platforms) {
      const account = await this.accountRepository.findOne({
        where: { id: platformTarget.accountId, userId },
      });

      if (!account) {
        throw new NotFoundException(
          `账号不存在: ${platformTarget.accountId}`,
        );
      }

      const platform = account.platform;

      // 格式适配
      const publishContent: PublishContent = {
        title: content.title,
        content: content.contentHtml || '',
        coverImage: content.coverImage || undefined,
        tags: content.tags || undefined,
      };

      const adapted = this.formatAdapterService.adaptContent(
        publishContent,
        platform,
      );

      // 创建发布任务
      const task = this.publishTaskRepository.create({
        userId,
        contentId: dto.contentId,
        accountId: platformTarget.accountId,
        platform,
        adaptedTitle: adapted.title,
        adaptedContent: adapted.content,
        status: 'pending' as PublishTaskStatus,
        scheduledAt: platformTarget.scheduledAt
          ? new Date(platformTarget.scheduledAt)
          : undefined,
        maxRetries: 3,
      });

      const savedTask = await this.publishTaskRepository.save(task);
      tasks.push(savedTask);

      // 加入 BullMQ 队列
      const jobOptions: Record<string, unknown> = {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 30000,
        },
      };

      // 如果有定时发布，设置延迟
      if (platformTarget.scheduledAt) {
        const scheduledTime = new Date(platformTarget.scheduledAt).getTime();
        const now = Date.now();
        if (scheduledTime > now) {
          jobOptions.delay = scheduledTime - now;
        }
      }

      await this.publishQueue.add(
        'publish',
        {
          taskId: savedTask.id,
          contentId: dto.contentId,
          accountId: platformTarget.accountId,
          platform,
          adaptedTitle: adapted.title,
          adaptedContent: adapted.content,
          coverImage: content.coverImage,
          tags: content.tags,
        },
        jobOptions,
      );

      this.logger.log(
        `Created publish task ${savedTask.id} for ${platform} account ${platformTarget.accountId}`,
      );
    }

    return tasks;
  }

  /**
   * 分页查询发布任务
   */
  async getTasks(
    userId: string,
    query: {
      page?: number;
      pageSize?: number;
      status?: string;
      platform?: string;
    },
  ): Promise<{ items: PublishTask[]; total: number; page: number; pageSize: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const where: Record<string, unknown> = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.platform) {
      where.platform = query.platform;
    }

    const [items, total] = await this.publishTaskRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['content', 'account'],
    });

    return { items, total, page, pageSize };
  }

  /**
   * 获取任务详情
   */
  async getTaskById(id: string, userId: string): Promise<PublishTask> {
    const task = await this.publishTaskRepository.findOne({
      where: { id, userId },
      relations: ['content', 'account'],
    });

    if (!task) {
      throw new NotFoundException('发布任务不存在');
    }

    return task;
  }

  /**
   * 重新加入队列
   */
  async retryTask(id: string, userId: string): Promise<PublishTask> {
    const task = await this.publishTaskRepository.findOne({
      where: { id, userId },
      relations: ['content'],
    });

    if (!task) {
      throw new NotFoundException('发布任务不存在');
    }

    if (task.status !== 'failed') {
      throw new BadRequestException('只能重试失败的发布任务');
    }

    // 更新任务状态
    task.status = 'pending';
    task.retryCount = 0;
    task.errorMessage = '';
    await this.publishTaskRepository.save(task);

    // 重新加入队列
    await this.publishQueue.add(
      'publish',
      {
        taskId: task.id,
        contentId: task.contentId,
        accountId: task.accountId,
        platform: task.platform,
        adaptedTitle: task.adaptedTitle,
        adaptedContent: task.adaptedContent,
        coverImage: task.content?.coverImage,
        tags: task.content?.tags,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 30000,
        },
      },
    );

    this.logger.log(`Retry task ${id}`);
    return task;
  }

  /**
   * 取消待发布任务
   */
  async cancelTask(id: string, userId: string): Promise<PublishTask> {
    const task = await this.publishTaskRepository.findOne({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('发布任务不存在');
    }

    if (task.status !== 'pending') {
      throw new BadRequestException('只能取消待发布的任务');
    }

    task.status = 'cancelled';
    await this.publishTaskRepository.save(task);

    this.logger.log(`Cancelled task ${id}`);
    return task;
  }

  /**
   * 发布历史
   */
  async getHistory(
    userId: string,
    query: {
      page?: number;
      pageSize?: number;
      platform?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ items: PublishTask[]; total: number; page: number; pageSize: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const where: Record<string, unknown> = {
      userId,
      status: 'success',
    };

    if (query.platform) {
      where.platform = query.platform;
    }

    if (query.startDate || query.endDate) {
      where.publishedAt = Between(
        query.startDate ? new Date(query.startDate) : new Date('1970-01-01'),
        query.endDate ? new Date(query.endDate) : new Date('2099-12-31'),
      );
    }

    const [items, total] = await this.publishTaskRepository.findAndCount({
      where,
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['content', 'account'],
    });

    return { items, total, page, pageSize };
  }
}
