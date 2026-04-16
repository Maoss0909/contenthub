import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishTask } from '../../common/entities/publish-task.entity';
import { Account } from '../../common/entities/account.entity';
import { TokenEncryptService } from '../account/token-encrypt.service';
import { PublishAdapter } from './adapters/publish-adapter.interface';

export interface PublishJobData {
  taskId: string;
  contentId: string;
  accountId: string;
  platform: string;
  adaptedTitle: string;
  adaptedContent: string;
  coverImage?: string;
  tags?: string[];
}

@Processor('publish_queue')
export class PublishProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    @InjectRepository(PublishTask)
    private readonly publishTaskRepository: Repository<PublishTask>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly tokenEncryptService: TokenEncryptService,
    private readonly adapters: PublishAdapter[],
  ) {
    super();
  }

  async process(job: Job<PublishJobData>): Promise<void> {
    const { taskId, accountId, platform, adaptedTitle, adaptedContent, coverImage, tags } = job.data;

    this.logger.log(
      `Processing publish job ${job.id} for task ${taskId}, platform: ${platform}`,
    );

    // 更新任务状态为处理中
    await this.publishTaskRepository.update(taskId, {
      status: 'processing',
    });

    try {
      // 查询账号并解密 Token
      const account = await this.accountRepository.findOne({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error(`账号不存在: ${accountId}`);
      }

      const accessToken = await this.decryptAccessToken(account);

      // 查找对应平台的适配器
      const adapter = this.adapters.find((a) => a.platform === platform);
      if (!adapter) {
        throw new Error(`不支持的平台适配器: ${platform}`);
      }

      // 调用平台发布接口
      const result = await adapter.publish(accessToken, {
        title: adaptedTitle,
        content: adaptedContent,
        coverImage,
        tags,
      });

      if (result.success) {
        await this.publishTaskRepository.update(taskId, {
          status: 'success',
          platformPostId: result.postId,
          platformPostUrl: result.postUrl,
          publishedAt: new Date(),
        });
        this.logger.log(`Task ${taskId} published successfully`);
      } else {
        await this.publishTaskRepository.update(taskId, {
          status: 'failed',
          errorMessage: result.errorMessage,
          retryCount: job.attemptsMade,
        });
        this.logger.error(
          `Task ${taskId} publish failed: ${result.errorMessage}`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Task ${taskId} error: ${message}`,
        stack,
      );
      await this.publishTaskRepository.update(taskId, {
        status: 'failed',
        errorMessage: `发布异常: ${message}`,
        retryCount: job.attemptsMade,
      });
      throw error; // 重新抛出以触发 Bull 重试
    }
  }

  /**
   * 解密账号的 access_token
   */
  private async decryptAccessToken(account: Account): Promise<string> {
    const extraData = account.extraData || {};
    const iv = extraData.accessTokenIv as string;
    const tag = extraData.accessTokenTag as string;

    if (!account.accessTokenEnc || !iv || !tag) {
      throw new Error(`账号 ${account.id} 的 access_token 不完整，请重新授权`);
    }

    return this.tokenEncryptService.decrypt(
      account.accessTokenEnc,
      iv,
      tag,
    );
  }
}
