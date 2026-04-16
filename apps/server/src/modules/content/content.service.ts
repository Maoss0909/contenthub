import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Content, ContentStatus } from '../../common/entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueryContentDto } from './dto/query-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  async create(userId: string, dto: CreateContentDto): Promise<Content> {
    const plainText = this.stripHtmlTags(dto.contentHtml);
    const wordCount = plainText.length;

    const content = new Content();
    content.userId = userId;
    content.title = dto.title;
    content.contentHtml = dto.contentHtml;
    content.contentJson = dto.contentJson as Record<string, unknown>;
    content.coverImage = dto.coverImage ?? '';
    content.tags = dto.tags || [];
    content.plainText = plainText;
    content.wordCount = wordCount;
    content.status = 'draft' as ContentStatus;

    return this.contentRepository.save(content);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findOne(id, userId);

    if (dto.title !== undefined) content.title = dto.title;
    if (dto.contentHtml !== undefined) {
      content.contentHtml = dto.contentHtml;
      content.plainText = this.stripHtmlTags(dto.contentHtml);
      content.wordCount = content.plainText.length;
    }
    if (dto.contentJson !== undefined) content.contentJson = dto.contentJson;
    if (dto.coverImage !== undefined) content.coverImage = dto.coverImage;
    if (dto.tags !== undefined) content.tags = dto.tags;

    return this.contentRepository.save(content);
  }

  async delete(id: string, userId: string): Promise<void> {
    const content = await this.findOne(id, userId);
    content.status = 'archived' as ContentStatus;
    await this.contentRepository.save(content);
  }

  async findOne(id: string, userId: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id, userId },
    });

    if (!content) {
      throw new NotFoundException('内容不存在');
    }

    return content;
  }

  async findAll(
    userId: string,
    query: QueryContentDto,
  ): Promise<{ items: Content[]; total: number; page: number; pageSize: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const where: Record<string, unknown> = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.keyword) {
      where.title = Like(`%${query.keyword}%`);
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'wordCount'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await this.contentRepository.findAndCount({
      where,
      order: { [safeSortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}
