export interface TokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // 秒
  expiresAt: Date;
  scope?: string;
}

export interface PlatformUserInfo {
  platformUserId: string;
  username: string;
  avatar?: string;
  extra?: Record<string, any>;
}

export interface PlatformProvider {
  platform: string;
  getAuthUrl(state: string, redirectUri: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<TokenResult>;
  refreshToken(refreshToken: string): Promise<TokenResult>;
  getUserInfo(accessToken: string): Promise<PlatformUserInfo>;
}
