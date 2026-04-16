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
export class WechatProvider implements PlatformProvider {
  private readonly logger = new Logger(WechatProvider.name);
  readonly platform = 'wechat';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly componentAppId: string;
  private readonly componentAppSecret: string;
  private readonly baseUrl = 'https://api.weixin.qq.com';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.clientId = this.configService.get<string>('oauth.wechat.clientId') || '';
    this.clientSecret =
      this.configService.get<string>('oauth.wechat.clientSecret') || '';
    this.componentAppId =
      this.configService.get<string>('oauth.wechat.componentAppId') || '';
    this.componentAppSecret =
      this.configService.get<string>('oauth.wechat.componentAppSecret') || '';
  }

  getAuthUrl(state: string, redirectUri: string): string {
    // 微信公众号第三方平台授权 URL (componentid 授权)
    const params = new URLSearchParams({
      component_appid: this.componentAppId,
      pre_auth_code: state, // 使用 state 携带 pre_auth_code
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'snsapi_base',
      state,
    });
    return `https://mp.weixin.qq.com/cgi-bin/componentloginpage?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenResult> {
    // 第一步：获取 component_access_token
    const componentTokenUrl = `${this.baseUrl}/cgi-bin/component/api_component_token`;
    const componentTokenRes: AxiosResponse = await firstValueFrom(
      this.httpService.post(componentTokenUrl, {
        component_appid: this.componentAppId,
        component_appsecret: this.componentAppSecret,
        component_verify_ticket: '',
      }),
    );

    const componentAccessToken =
      componentTokenRes.data?.component_access_token;
    if (!componentAccessToken) {
      throw new Error(
        `Failed to get component_access_token: ${JSON.stringify(componentTokenRes.data)}`,
      );
    }

    // 第二步：用 code 换取 authorizer_access_token
    const tokenUrl = `${this.baseUrl}/cgi-bin/component/api_query_auth?component_access_token=${componentAccessToken}`;
    const tokenRes: AxiosResponse = await firstValueFrom(
      this.httpService.post(tokenUrl, {
        component_appid: this.componentAppId,
        authorization_code: code,
      }),
    );

    const data = tokenRes.data?.authorization_info;
    if (!data?.authorizer_access_token) {
      throw new Error(
        `Failed to exchange code for token: ${JSON.stringify(tokenRes.data)}`,
      );
    }

    const expiresIn = data.expires_in || 7200;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken: data.authorizer_access_token,
      refreshToken: data.authorizer_refresh_token,
      expiresIn,
      expiresAt,
      scope: data.func_info?.map((f: any) => f.funcscope_category?.id).join(','),
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    // 先获取 component_access_token
    const componentTokenUrl = `${this.baseUrl}/cgi-bin/component/api_component_token`;
    const componentTokenRes: AxiosResponse = await firstValueFrom(
      this.httpService.post(componentTokenUrl, {
        component_appid: this.componentAppId,
        component_appsecret: this.componentAppSecret,
        component_verify_ticket: '',
      }),
    );

    const componentAccessToken =
      componentTokenRes.data?.component_access_token;
    if (!componentAccessToken) {
      throw new Error('Failed to get component_access_token for refresh');
    }

    // 使用 component_access_token + authorizer_refresh_token 刷新
    const refreshUrl = `${this.baseUrl}/cgi-bin/component/api_authorizer_token?component_access_token=${componentAccessToken}`;
    const refreshRes: AxiosResponse = await firstValueFrom(
      this.httpService.post(refreshUrl, {
        component_appid: this.componentAppId,
        authorizer_appid: this.clientId,
        authorizer_refresh_token: refreshToken,
      }),
    );

    const data = refreshRes.data;
    if (!data?.authorizer_access_token) {
      throw new Error(
        `Failed to refresh token: ${JSON.stringify(refreshRes.data)}`,
      );
    }

    const expiresIn = data.expires_in || 7200;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken: data.authorizer_access_token,
      refreshToken: data.authorizer_refresh_token || refreshToken,
      expiresIn,
      expiresAt,
    };
  }

  async getUserInfo(accessToken: string): Promise<PlatformUserInfo> {
    const url = `${this.baseUrl}/cgi-bin/component/api_get_authorizer_info?component_access_token=${accessToken}`;
    const res: AxiosResponse = await firstValueFrom(
      this.httpService.post(url, {
        component_appid: this.componentAppId,
        authorizer_appid: this.clientId,
      }),
    );

    const data = res.data?.authorizer_info;
    if (!data) {
      throw new Error(
        `Failed to get user info: ${JSON.stringify(res.data)}`,
      );
    }

    return {
      platformUserId: data.user_name || '',
      username: data.nick_name || data.user_name || '',
      avatar: data.head_img || data.qrcode_url,
      extra: {
        serviceTypeInfo: data.service_type_info,
        verifyTypeInfo: data.verify_type_info,
        alias: data.alias,
        signature: data.signature,
      },
    };
  }
}
