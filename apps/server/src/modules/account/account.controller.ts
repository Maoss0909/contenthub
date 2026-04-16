import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AccountService } from './account.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * 获取用户所有绑定账号
   */
  @Get()
  async getAccounts(@CurrentUser('id') userId: string) {
    return this.accountService.getAccounts(userId);
  }

  /**
   * 批量获取授权状态
   */
  @Get('status')
  async getAccountsStatus(@CurrentUser('id') userId: string) {
    return this.accountService.getAccountsStatus(userId);
  }

  /**
   * 获取支持的平台列表
   */
  @Get('platforms')
  async getSupportedPlatforms() {
    return this.accountService.getSupportedPlatforms();
  }

  /**
   * 发起绑定 - 生成 OAuth 授权 URL
   */
  @Post('bind/:platform')
  async initiateBinding(
    @CurrentUser('id') userId: string,
    @Param('platform') platform: string,
  ) {
    return this.accountService.initiateBinding(userId, platform);
  }

  /**
   * OAuth 回调处理
   * 公开接口，不需要 JWT 鉴权
   */
  @Public()
  @Get('callback/:platform')
  async handleCallback(
    @Param('platform') _platform: string,
    @Query() dto: OAuthCallbackDto,
    @Res() res: Response,
  ) {
    try {
      const account = await this.accountService.handleCallback(
        dto.code,
        dto.state,
      );

      // 重定向到前端页面，携带绑定结果
      const frontendUrl =
        process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/oauth/success?accountId=${account.id}&platform=${account.platform}`;
      res.redirect(redirectUrl);
    } catch (error: unknown) {
      const frontendUrl =
        process.env.FRONTEND_URL || 'http://localhost:5173';
      const message = error instanceof Error ? error.message : String(error);
      const redirectUrl = `${frontendUrl}/oauth/fail?error=${encodeURIComponent(message)}`;
      res.redirect(redirectUrl);
    }
  }

  /**
   * 解绑账号
   */
  @Delete(':id')
  async unbindAccount(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.accountService.unbindAccount(id, userId);
    return { message: '账号已解绑' };
  }

  /**
   * 手动刷新 Token
   */
  @Post(':id/refresh-token')
  async refreshAccountToken(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const account = await this.accountService.refreshAccountToken(id, userId);
    return {
      message: 'Token 刷新成功',
      tokenExpiresAt: account.tokenExpiresAt,
      authStatus: account.authStatus,
    };
  }
}
