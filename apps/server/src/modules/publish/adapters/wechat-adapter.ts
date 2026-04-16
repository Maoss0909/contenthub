import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { AxiosResponse } from 'axios';
import {
  PublishAdapter,
  PublishContent,
  PublishResult,
} from './publish-adapter.interface';

@Injectable()
export class WechatAdapter implements PublishAdapter {
  private readonly logger = new Logger(WechatAdapter.name);
  readonly platform = 'wechat';

  private readonly draftUrl =
    'https://api.weixin.qq.com/cgi-bin/draft/add';
  private readonly publishUrl =
    'https://api.weixin.qq.com/cgi-bin/freepublish/submit';

  constructor(private readonly httpService: HttpService) {}

  async publish(
    accessToken: string,
    content: PublishContent,
  ): Promise<PublishResult> {
    try {
      // 第一步: 添加到草稿箱
      const draftBody = {
        articles: [
          {
            title: content.title,
            content: content.content,
            thumb_media_id: content.coverImage || '',
            digest: this.extractDigest(content.content),
            content_source_url: '',
          },
        ],
      };

      const draftResponse: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this.draftUrl}?access_token=${accessToken}`,
          draftBody,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      if (draftResponse.data.errcode && draftResponse.data.errcode !== 0) {
        this.logger.error(
          `WeChat draft add failed: ${draftResponse.data.errmsg}`,
        );
        return {
          success: false,
          errorMessage: `草稿箱添加失败: ${draftResponse.data.errmsg}`,
        };
      }

      const mediaId = draftResponse.data.media_id;

      // 第二步: 提交发布
      const publishBody = { media_id: mediaId };

      const publishResponse: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this.publishUrl}?access_token=${accessToken}`,
          publishBody,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      if (publishResponse.data.errcode && publishResponse.data.errcode !== 0) {
        this.logger.error(
          `WeChat publish submit failed: ${publishResponse.data.errmsg}`,
        );
        return {
          success: false,
          errorMessage: `发布提交失败: ${publishResponse.data.errmsg}`,
        };
      }

      const publishId = publishResponse.data.publish_id;

      return {
        success: true,
        postId: publishId,
        postUrl: `https://mp.weixin.qq.com/s?__biz=${publishId}`,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`WeChat publish error: ${message}`, stack);
      return {
        success: false,
        errorMessage: `微信公众号发布异常: ${message}`,
      };
    }
  }

  /**
   * 从 HTML 内容中提取摘要 (纯文本, 最多 120 字符)
   */
  private extractDigest(html: string): string {
    const text = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  }
}
