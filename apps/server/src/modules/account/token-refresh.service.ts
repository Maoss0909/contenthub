import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import { Account } from '../../common/entities/account.entity';
import { TokenEncryptService } from './token-encrypt.service';
import { PlatformProvider } from './providers/platform-provider.interface';

@Injectable()
export class TokenRefreshService {
  private readonly logger = new Logger(TokenRefreshService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly tokenEncryptService: TokenEncryptService,
    private readonly providers: PlatformProvider[],
  ) {}

  private getProvider(platform: string): PlatformProvider | undefined {
    return this.providers.find((p) => p.platform === platform);
  }

  @Cron('0 */2 * * *')
  async refreshAllTokens(): Promise<void> {
    this.logger.log('Starting scheduled token refresh check...');

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const accounts = await this.accountRepository.find({
      where: {
        authStatus: 'active' as any,
        refreshTokenEnc: Not(IsNull()),
        unboundAt: IsNull(),
        tokenExpiresAt: LessThan(sevenDaysLater) as any,
      },
    });

    this.logger.log(
      `Found ${accounts.length} accounts with tokens expiring within 7 days`,
    );

    for (const account of accounts) {
      try {
        await this.refreshAccountToken(account);
        this.logger.log(
          `Successfully refreshed token for account ${account.id} (${account.platform})`,
        );
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `Failed to refresh token for account ${account.id} (${account.platform}): ${message}`,
          stack,
        );
      }
    }

    this.logger.log('Scheduled token refresh check completed');
  }

  async refreshAccountToken(account: Account): Promise<Account> {
    const provider = this.getProvider(account.platform);
    if (!provider) {
      throw new Error(`No provider found for platform: ${account.platform}`);
    }

    if (!account.refreshTokenEnc) {
      throw new Error(
        `Account ${account.id} has no refresh token, cannot refresh`,
      );
    }

    // 解密 refresh token
    const refreshToken = await this.tokenEncryptService.decrypt(
      account.refreshTokenEnc,
      (account.extraData as any)?.refreshTokenIv || '',
      (account.extraData as any)?.refreshTokenTag || '',
    );

    // 调用 provider 刷新 token
    const tokenResult = await provider.refreshToken(refreshToken);

    // 加密新的 access token
    const { encrypted, iv, tag } = await this.tokenEncryptService.encrypt(
      tokenResult.accessToken,
    );

    // 加密新的 refresh token（如果有）
    let newRefreshTokenEnc: string | null = null;
    let newRefreshTokenIv = '';
    let newRefreshTokenTag = '';
    if (tokenResult.refreshToken) {
      const refreshEncrypted = await this.tokenEncryptService.encrypt(
        tokenResult.refreshToken,
      );
      newRefreshTokenEnc = refreshEncrypted.encrypted;
      newRefreshTokenIv = refreshEncrypted.iv;
      newRefreshTokenTag = refreshEncrypted.tag;
    }

    // 更新数据库
    account.accessTokenEnc = encrypted;
    if (newRefreshTokenEnc) {
      account.refreshTokenEnc = newRefreshTokenEnc;
    }
    account.tokenExpiresAt = tokenResult.expiresAt;
    account.lastRefreshedAt = new Date();

    // 更新 extraData 中的 iv 和 tag
    const extraData = {
      ...(account.extraData || {}),
      accessTokenIv: iv,
      accessTokenTag: tag,
      refreshTokenIv: newRefreshTokenIv,
      refreshTokenTag: newRefreshTokenTag,
    };
    account.extraData = extraData;

    // 根据 expiresAt 更新 auth_status
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (tokenResult.expiresAt < now) {
      account.authStatus = 'expired';
    } else if (tokenResult.expiresAt < sevenDaysLater) {
      account.authStatus = 'expiring';
    } else {
      account.authStatus = 'active';
    }

    return this.accountRepository.save(account);
  }
}
