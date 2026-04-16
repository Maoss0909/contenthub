import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type ContentStatus = 'draft' | 'published' | 'archived';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', name: 'content_html', nullable: true })
  contentHtml: string;

  @Column({ type: 'jsonb', name: 'content_json', nullable: true })
  contentJson: Record<string, unknown>;

  @Column({ type: 'text', name: 'plain_text', nullable: true })
  plainText: string;

  @Column({ type: 'varchar', length: 500, name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ type: 'int', default: 0, name: 'word_count' })
  wordCount: number;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: ContentStatus;

  @Column({ type: 'varchar', array: true, nullable: true })
  tags: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'published_at', nullable: true })
  publishedAt: Date;
}
