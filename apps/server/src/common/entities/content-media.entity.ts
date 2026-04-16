import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Content } from './content.entity';
import { Media } from './media.entity';

@Entity('content_media')
export class ContentMedia {
  @PrimaryColumn({ type: 'uuid', name: 'content_id' })
  contentId: string;

  @PrimaryColumn({ type: 'uuid', name: 'media_id' })
  mediaId: string;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;
}
