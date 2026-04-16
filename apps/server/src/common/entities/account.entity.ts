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

export type AuthStatus = 'active' | 'expiring' | 'expired' | 'revoked';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  platform: string;

  @Column({ type: 'varchar', length: 255, name: 'platform_user_id' })
  platformUserId: string;

  @Column({ type: 'varchar', length: 255, name: 'platform_username', nullable: true })
  platformUsername: string;

  @Column({ type: 'varchar', length: 500, name: 'platform_avatar', nullable: true })
  platformAvatar: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string;

  @Column({ type: 'text', name: 'access_token_enc', nullable: true })
  accessTokenEnc: string;

  @Column({ type: 'text', name: 'refresh_token_enc', nullable: true })
  refreshTokenEnc: string;

  @Column({ type: 'timestamptz', name: 'token_expires_at', nullable: true })
  tokenExpiresAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'active', name: 'auth_status' })
  authStatus: AuthStatus;

  @Column({ type: 'jsonb', nullable: true, name: 'extra_data' })
  extraData: Record<string, unknown>;

  @Column({ type: 'timestamptz', name: 'last_refreshed_at', nullable: true })
  lastRefreshedAt: Date;

  @Column({ type: 'timestamptz', name: 'bound_at', nullable: true })
  boundAt: Date;

  @Column({ type: 'timestamptz', name: 'unbound_at', nullable: true })
  unboundAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
