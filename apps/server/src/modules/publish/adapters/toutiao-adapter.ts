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
export class ToutiaoAdapter implements PublishAdapter {
  private readonly logger = new Logger(ToutiaoAdapter.name);
  readonly platform = 'toutiao';

  private readonly publishUrl =
    'https://open.douyin.com/article/content/publish/';

  constructor(private readonly httpService: HttpService) {}

  async publish(
    accessToken: string,
    content: PublishContent,
  ): Promise<PublishResult> {
    try {
      const body = {
        title: content.title,
        content: content.content,
        cover_image: content.coverImage || '',
        article_type: 0,
      };

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(this.publishUrl, body, {
          headers: {
            'Content-Type': 'application/json',
            'access-token': accessToken,
          },
        }),
      );

      const data = response.data;

      if (data.error_code && data.error_code !== 0) {
        this.logger.error(
          `Toutiao publish failed: ${data.description || data.message}`,
        );
        return {
          success: false,
          errorMessage: `头条发布失败: ${data.description || data.message}`,
        };
      }

      return {
        success: true,
        postId: data.data?.article_id || data.article_id,
        postUrl: data.data?.article_url || data.article_url,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Toutiao publish error: ${message}`, stack);
      return {
        success: false,
        errorMessage: `头条发布异常: ${message}`,
      };
    }
  }
}
