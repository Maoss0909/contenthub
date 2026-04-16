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
import { Content } from './content.entity';
import { Account } from './account.entity';

export type PublishTaskStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'partial'
  | 'cancelled';

@Entity('publish_tasks')
export class PublishTask {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'content_id' })
  contentId: string;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'varchar', length: 50 })
  platform: string;

  @Column({ type: 'varchar', length: 500, name: 'adapted_title', nullable: true })
  adaptedTitle: string;

  @Column({ type: 'text', name: 'adapted_content', nullable: true })
  adaptedContent: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: PublishTaskStatus;

  @Column({ type: 'varchar', length: 255, name: 'platform_post_id', nullable: true })
  platformPostId: string;

  @Column({ type: 'varchar', length: 1000, name: 'platform_post_url', nullable: true })
  platformPostUrl: string;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ type: 'int', name: 'max_retries', default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamptz', name: 'next_retry_at', nullable: true })
  nextRetryAt: Date;

  @Column({ type: 'timestamptz', name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamptz', name: 'published_at', nullable: true })
  publishedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
