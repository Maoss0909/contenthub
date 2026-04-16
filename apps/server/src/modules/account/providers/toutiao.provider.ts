import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { AxiosResponse } from 'axios';
import {
  PlatformProvider,
  TokenResult,
  PlatformUserInfo,
} from './platform-provider.interface';

@Injectable()
export class ToutiaoProvider implements PlatformProvider {
  private readonly logger = new Logger(ToutiaoProvider.name);
  readonly platform = 'toutiao';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl = 'https://open.douyin.com';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.clientId =
      this.configService.get<string>('oauth.toutiao.clientId') || '';
    this.clientSecret =
      this.configService.get<string>('oauth.toutiao.clientSecret') || '';
  }

  getAuthUrl(state: string, redirectUri: string): string {
    // 头条/抖音开放平台 OAuth 2.0 授权码模式
    const params = new URLSearchParams({
      client_key: this.clientId,
      scope: 'user_info',
      response_type: 'code',
      redirect_uri: redirectUri,
      state,
    });
    return `${this.baseUrl}/platform/oauth/connect/?${params.toString()}`;
  }

  async exchangeCode(code: string, _redirectUri: string): Promise<TokenResult> {
    const url = `${this.baseUrl}/oauth/client_token/`;
    const res: AxiosResponse = await firstValueFrom(
      this.httpService.post(url, {
        client_key: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code,
      }),
    );

    const data = res.data?.data;
    if (!data?.access_token) {
      throw new Error(
        `Failed to exchange code for token: ${JSON.stringify(res.data)}`,
      );
    }

    const expiresIn = data.expires_in || 86400;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn,
      expiresAt,
      scope: data.scope,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    const url = `${this.baseUrl}/oauth/client_token/`;
    const res2: AxiosResponse = await firstValueFrom(
      this.httpService.post(url, {
        client_key: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    );

    const data = res2.data?.data;
    if (!data?.access_token) {
      throw new Error(
        `Failed to refresh token: ${JSON.stringify(res2.data)}`,
      );
    }

    const expiresIn = data.expires_in || 86400;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn,
      expiresAt,
      scope: data.scope,
    };
  }

  async getUserInfo(accessToken: string): Promise<PlatformUserInfo> {
    const url = `${this.baseUrl}/oauth/userinfo/`;
    const res3: AxiosResponse = await firstValueFrom(
      this.httpService.get(url, {
        headers: { 'access-token': accessToken },
      }),
    );

    const data = res3.data?.data;
    if (!data?.open_id) {
      throw new Error(
        `Failed to get user info: ${JSON.stringify(res3.data)}`,
      );
    }

    return {
      platformUserId: data.open_id,
      username: data.nickname || data.name || '',
      avatar: data.avatar || data.head_image,
      extra: {
        unionId: data.union_id,
        city: data.city,
        province: data.province,
        country: data.country,
        gender: data.gender,
      },
    };
  }
}
