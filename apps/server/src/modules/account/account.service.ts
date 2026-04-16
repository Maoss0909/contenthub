import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Account, AuthStatus } from '../../common/entities/account.entity';
import { TokenEncryptService } from './token-encrypt.service';
import { TokenRefreshService } from './token-refresh.service';
import { PlatformProvider } from './providers/platform-provider.interface';

export interface SupportedPlatform {
  platform: string;
  name: string;
  description: string;
  icon?: string;
}

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  private readonly supportedPlatforms: SupportedPlatform[] = [
    {
      platform: 'wechat',
      name: '微信公众号',
      description: '绑定微信公众号，实现内容同步发布',
    },
    {
      platform: 'toutiao',
      name: '头条号',
      description: '绑定头条号，实现内容同步发布',
    },
  ];

  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly configService: ConfigService,
    private readonly tokenEncryptService: TokenEncryptService,
    private readonly tokenRefreshService: TokenRefreshService,
    private readonly providers: PlatformProvider[],
  ) {}

  private getProvider(platform: string): PlatformProvider {
    const provider = this.providers.find((p) => p.platform === platform);
    if (!provider) {
      throw new BadRequestException(`不支持的平台: ${platform}`);
    }
    return provider;
  }

  private getRedirectUri(platform: string): string {
    const redirectUri = this.configService.get<string>(
      `oauth.${platform}.redirectUri`,
    );
    if (!redirectUri) {
      throw new BadRequestException(`未配置 ${platform} 的回调地址`);
    }
    return redirectUri;
  }

  /**
   * 获取用户所有绑定账号
   */
  async getAccounts(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: {
        userId,
        unboundAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个账号详情
   */
  async getAccountById(id: string, userId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId, unboundAt: IsNull() },
    });

    if (!account) {
      throw new NotFoundException('账号不存在或已解绑');
    }

    return account;
  }

  /**
   * 生成 OAuth 授权 URL
   * state = 加密的 userId:platform:timestamp
   */
  async initiateBinding(
    userId: string,
    platform: string,
  ): Promise<{ authUrl: string }> {
    this.getProvider(platform); // 验证平台是否支持

    // 检查是否已绑定该平台
    const existing = await this.accountRepository.findOne({
      where: { userId, platform, unboundAt: IsNull() },
    });
    if (existing) {
      throw new BadRequestException(`已绑定 ${platform} 平台账号，请先解绑`);
    }

    // 生成 state: userId:platform:timestamp
    const timestamp = Date.now().toString();
    const statePayload = `${userId}:${platform}:${timestamp}`;
    const { encrypted: state } = await this.tokenEncryptService.encrypt(
      statePayload,
    );

    const redirectUri = this.getRedirectUri(platform);
    const provider = this.getProvider(platform);
    const authUrl = provider.getAuthUrl(state, redirectUri);

    return { authUrl };
  }

  /**
   * 处理 OAuth 回调
   * 解析 state -> 调用 provider.exchangeCode -> 调用 provider.getUserInfo -> 加密存储 Token -> 创建 Account 记录
   */
  async handleCallback(code: string, state: string): Promise<Account> {
    // 解析 state
    let statePayload: string;
    try {
      // state 是加密的，需要解密
      // state 格式: encrypted:iv:tag (用 : 分隔)
      const parts = state.split(':');
      if (parts.length < 3) {
        throw new Error('Invalid state format');
      }
      const encrypted = parts.slice(0, -2).join(':');
      const iv = parts[parts.length - 2];
      const tag = parts[parts.length - 1];
      statePayload = await this.tokenEncryptService.decrypt(encrypted, iv, tag);
    } catch {
      throw new BadRequestException('无效的授权状态参数');
    }

    const [userId, platform, timestamp] = statePayload.split(':');

    // 验证时间戳（10分钟内有效）
    const stateTime = parseInt(timestamp, 10);
    if (Date.now() - stateTime > 10 * 60 * 1000) {
      throw new BadRequestException('授权链接已过期，请重新发起绑定');
    }

    const provider = this.getProvider(platform);
    const redirectUri = this.getRedirectUri(platform);

    // 用 code 换取 token
    const tokenResult = await provider.exchangeCode(code, redirectUri);

    // 获取平台用户信息
    const userInfo = await provider.getUserInfo(tokenResult.accessToken);

    // 加密存储 Token
    const accessTokenEncrypted = await this.tokenEncryptService.encrypt(
      tokenResult.accessToken,
    );

    let refreshTokenEncrypted: string | null = null;
    let refreshTokenIv = '';
    let refreshTokenTag = '';
    if (tokenResult.refreshToken) {
      const refreshEncrypted = await this.tokenEncryptService.encrypt(
        tokenResult.refreshToken,
      );
      refreshTokenEncrypted = refreshEncrypted.encrypted;
      refreshTokenIv = refreshEncrypted.iv;
      refreshTokenTag = refreshEncrypted.tag;
    }

    // 创建 Account 记录
    const account = this.accountRepository.create({
      userId,
      platform,
      platformUserId: userInfo.platformUserId,
      platformUsername: userInfo.username,
      platformAvatar: userInfo.avatar,
      accessTokenEnc: accessTokenEncrypted.encrypted,
      refreshTokenEnc: refreshTokenEncrypted ?? undefined,
      tokenExpiresAt: tokenResult.expiresAt,
      authStatus: 'active',
      extraData: {
        accessTokenIv: accessTokenEncrypted.iv,
        accessTokenTag: accessTokenEncrypted.tag,
        refreshTokenIv,
        refreshTokenTag,
        scope: tokenResult.scope,
        ...userInfo.extra,
      },
      lastRefreshedAt: new Date(),
      boundAt: new Date(),
    } as Partial<Account>);

    const saved = await this.accountRepository.save(account);
    this.logger.log(
      `User ${userId} bound ${platform} account ${userInfo.platformUserId}`,
    );
    return saved;
  }

  /**
   * 解绑账号 (软删除)
   */
  async unbindAccount(id: string, userId: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id, userId, unboundAt: IsNull() },
    });

    if (!account) {
      throw new NotFoundException('账号不存在或已解绑');
    }

    account.unboundAt = new Date();
    account.authStatus = 'revoked';

    await this.accountRepository.save(account);
    this.logger.log(`User ${userId} unbound account ${id}`);
  }

  /**
   * 手动刷新 Token
   */
  async refreshAccountToken(id: string, userId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId, unboundAt: IsNull() },
    });

    if (!account) {
      throw new NotFoundException('账号不存在或已解绑');
    }

    return this.tokenRefreshService.refreshAccountToken(account);
  }

  /**
   * 批量获取授权状态
   */
  async getAccountsStatus(
    userId: string,
  ): Promise<
    { id: string; platform: string; authStatus: AuthStatus; tokenExpiresAt: Date | null }[]
  > {
    const accounts = await this.accountRepository.find({
      where: { userId, unboundAt: IsNull() },
      select: ['id', 'platform', 'authStatus', 'tokenExpiresAt'],
    });

    return accounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      authStatus: a.authStatus,
      tokenExpiresAt: a.tokenExpiresAt,
    }));
  }

  /**
   * 返回支持的平台列表和配置
   */
  getSupportedPlatforms(): SupportedPlatform[] {
    return this.supportedPlatforms;
  }

  /**
   * 根据 token_expires_at 更新 auth_status (active/expiring/expired)
   */
  async updateAuthStatus(): Promise<void> {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 查找所有活跃且未解绑的账号
    const accounts = await this.accountRepository.find({
      where: {
        authStatus: Not(In(['revoked'])),
        unboundAt: IsNull(),
        tokenExpiresAt: Not(IsNull()),
      },
    });

    const updates: Promise<Account>[] = [];

    for (const account of accounts) {
      if (!account.tokenExpiresAt) continue;

      let newStatus: AuthStatus;
      if (account.tokenExpiresAt < now) {
        newStatus = 'expired';
      } else if (account.tokenExpiresAt < sevenDaysLater) {
        newStatus = 'expiring';
      } else {
        newStatus = 'active';
      }

      if (newStatus !== account.authStatus) {
        account.authStatus = newStatus;
        updates.push(this.accountRepository.save(account));
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
      this.logger.log(`Updated auth status for ${updates.length} accounts`);
    }
  }
}
