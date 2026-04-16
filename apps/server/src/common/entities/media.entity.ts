import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  filename: string;

  @Column({ type: 'varchar', length: 500, name: 'original_name' })
  originalName: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'varchar', length: 1000 })
  url: string;

  @Column({ type: 'varchar', length: 1000, name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  folder: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  tags: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
