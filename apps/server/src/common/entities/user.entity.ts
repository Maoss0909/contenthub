import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'operator' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'disabled' | 'deleted';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 20, default: 'viewer' })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: UserStatus;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'last_login_at',
  })
  lastLoginAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
