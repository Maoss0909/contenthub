import { Injectable, BadRequestException } from '@nestjs/common';
import { PublishContent } from './adapters/publish-adapter.interface';

export interface PlatformFormatRule {
  maxTitleLength: number;
  maxImageCount: number | null; // null 表示不限制
  maxImageWidth: number;
  supportGif: boolean;
  supportExternalLink: boolean;
}

export interface AdaptedContent extends PublishContent {
  warnings: string[];
}

@Injectable()
export class FormatAdapterService {
  private readonly platformRules: Record<string, PlatformFormatRule> = {
    wechat: {
      maxTitleLength: 64,
      maxImageCount: null,
      maxImageWidth: 900,
      supportGif: true,
      supportExternalLink: false,
    },
    toutiao: {
      maxTitleLength: 30,
      maxImageCount: 20,
      maxImageWidth: 1080,
      supportGif: false,
      supportExternalLink: false,
    },
  };

  getRules(platform: string): PlatformFormatRule {
    const rules = this.platformRules[platform];
    if (!rules) {
      throw new BadRequestException(`不支持的平台: ${platform}`);
    }
    return rules;
  }

  /**
   * 根据平台规则适配内容
   */
  adaptContent(
    content: PublishContent,
    platform: string,
  ): AdaptedContent {
    const rules = this.getRules(platform);
    const warnings: string[] = [];

    // 标题截断
    let title = content.title;
    if (title.length > rules.maxTitleLength) {
      title = title.substring(0, rules.maxTitleLength) + '...';
      warnings.push(
        `标题超出 ${rules.maxTitleLength} 字限制，已截断`,
      );
    }

    // HTML 内容处理
    let html = content.content;

    // 移除不支持的 GIF 图片
    if (!rules.supportGif) {
      const gifPattern =
        /<img[^>]+src=["']([^"']+\.(gif|GIF)(\?[^"']*)?)["'][^>]*>/gi;
      const gifMatches = html.match(gifPattern);
      if (gifMatches && gifMatches.length > 0) {
        html = html.replace(gifPattern, '');
        warnings.push(
          `已移除 ${gifMatches.length} 张 GIF 图片 (${platform} 不支持 GIF)`,
        );
      }
    }

    // 外链处理: 不支持外链的平台将 <a> 转为纯文本
    if (!rules.supportExternalLink) {
      const linkPattern = /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
      const linkMatches = html.match(linkPattern);
      if (linkMatches && linkMatches.length > 0) {
        html = html.replace(linkPattern, '$2');
        warnings.push(
          `已将 ${linkMatches.length} 个外链转换为纯文本 (${platform} 不支持外链)`,
        );
      }
    }

    // 图片数量检查
    if (rules.maxImageCount !== null) {
      const imagePattern = /<img[^>]+>/gi;
      const images = html.match(imagePattern);
      if (images && images.length > rules.maxImageCount) {
        // 保留前 maxImageCount 张图片，移除多余的
        let count = 0;
        html = html.replace(imagePattern, (match) => {
          count++;
          if (count <= (rules.maxImageCount as number)) {
            return match;
          }
          return '';
        });
        warnings.push(
          `图片数量超出 ${rules.maxImageCount} 张限制，已移除多余的图片`,
        );
      }
    }

    return {
      title,
      content: html,
      coverImage: content.coverImage,
      tags: content.tags,
      warnings,
    };
  }

  /**
   * 获取适配预览 (不实际修改内容，仅返回适配后的结果和警告)
   */
  getPreview(
    content: PublishContent,
    platform: string,
  ): { adapted: AdaptedContent; rules: PlatformFormatRule } {
    const rules = this.getRules(platform);
    const adapted = this.adaptContent(content, platform);
    return { adapted, rules };
  }
}
