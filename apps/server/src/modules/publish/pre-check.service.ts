import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Account } from '../../common/entities/account.entity';
import { PublishTask } from '../../common/entities/publish-task.entity';
import { FormatAdapterService } from './format-adapter.service';

export interface CheckResult {
  passed: boolean;
  message?: string;
}

export interface PreCheckResult {
  accountId: string;
  platform: string;
  passed: boolean;
  checks: {
    title: CheckResult;
    images: CheckResult;
    auth: CheckResult;
    duplicate: CheckResult;
  };
}

@Injectable()
export class PreCheckService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(PublishTask)
    private readonly publishTaskRepository: Repository<PublishTask>,
    private readonly formatAdapterService: FormatAdapterService,
  ) {}

  /**
   * 检查标题字数
   */
  checkTitle(title: string, platform: string): CheckResult {
    const rules = this.formatAdapterService.getRules(platform);
    if (!title || title.trim().length === 0) {
      return { passed: false, message: '标题不能为空' };
    }
    if (title.length > rules.maxTitleLength) {
      return {
        passed: false,
        message: `标题长度 ${title.length} 超出限制 ${rules.maxTitleLength} 字`,
      };
    }
    return { passed: true };
  }

  /**
   * 检查图片数量和格式
   */
  checkImages(contentHtml: string, platform: string): CheckResult {
    const rules = this.formatAdapterService.getRules(platform);

    // 检查 GIF
    if (!rules.supportGif) {
      const gifPattern =
        /<img[^>]+src=["']([^"']+\.(gif|GIF)(\?[^"']*)?)["'][^>]*>/i;
      if (gifPattern.test(contentHtml)) {
        return {
          passed: false,
          message: `${platform} 不支持 GIF 图片，请移除或替换`,
        };
      }
    }

    // 检查图片数量
    if (rules.maxImageCount !== null) {
      const imagePattern = /<img[^>]+>/gi;
      const images = contentHtml.match(imagePattern);
      const count = images ? images.length : 0;
      if (count > rules.maxImageCount) {
        return {
          passed: false,
          message: `图片数量 ${count} 超出限制 ${rules.maxImageCount} 张`,
        };
      }
    }

    return { passed: true };
  }

  /**
   * 检查授权状态
   */
  async checkAuth(accountId: string): Promise<CheckResult> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      return { passed: false, message: '账号不存在' };
    }

    if (account.unboundAt) {
      return { passed: false, message: '账号已解绑' };
    }

    if (account.authStatus === 'expired') {
      return { passed: false, message: '授权已过期，请重新授权' };
    }

    if (account.authStatus === 'revoked') {
      return { passed: false, message: '授权已撤销' };
    }

    return { passed: true };
  }

  /**
   * 检查是否重复发布 (同一内容 + 同一账号 + 成功或待处理状态)
   */
  async checkDuplicate(
    contentId: string,
    accountId: string,
  ): Promise<CheckResult> {
    const existing = await this.publishTaskRepository.findOne({
      where: {
        contentId,
        accountId,
        status: In(['success', 'pending', 'processing']),
      },
    });

    if (existing) {
      return {
        passed: false,
        message: `该内容已发布或正在发布到此账号 (任务ID: ${existing.id})`,
      };
    }

    return { passed: true };
  }

  /**
   * 执行所有预检查
   */
  async preCheck(
    contentId: string,
    title: string,
    contentHtml: string,
    accountIds: string[],
  ): Promise<PreCheckResult[]> {
    const results: PreCheckResult[] = [];

    for (const accountId of accountIds) {
      const account = await this.accountRepository.findOne({
        where: { id: accountId },
      });

      if (!account) {
        results.push({
          accountId,
          platform: 'unknown',
          passed: false,
          checks: {
            title: { passed: false, message: '账号不存在' },
            images: { passed: false, message: '账号不存在' },
            auth: { passed: false, message: '账号不存在' },
            duplicate: { passed: false, message: '账号不存在' },
          },
        });
        continue;
      }

      const platform = account.platform;

      const [titleCheck, imagesCheck, authCheck, duplicateCheck] =
        await Promise.all([
          Promise.resolve(this.checkTitle(title, platform)),
          Promise.resolve(this.checkImages(contentHtml, platform)),
          this.checkAuth(accountId),
          this.checkDuplicate(contentId, accountId),
        ]);

      const allPassed =
        titleCheck.passed &&
        imagesCheck.passed &&
        authCheck.passed &&
        duplicateCheck.passed;

      results.push({
        accountId,
        platform,
        passed: allPassed,
        checks: {
          title: titleCheck,
          images: imagesCheck,
          auth: authCheck,
          duplicate: duplicateCheck,
        },
      });
    }

    return results;
  }
}
