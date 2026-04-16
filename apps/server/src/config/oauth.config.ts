import { registerAs } from '@nestjs/config';

export default registerAs('oauth', () => ({
  wechat: {
    clientId: process.env.WECHAT_CLIENT_ID || '',
    clientSecret: process.env.WECHAT_CLIENT_SECRET || '',
    redirectUri:
      process.env.WECHAT_REDIRECT_URI ||
      'http://localhost:5173/oauth/callback/wechat',
  },
  toutiao: {
    clientId: process.env.TOUTIAO_CLIENT_ID || '',
    clientSecret: process.env.TOUTIAO_CLIENT_SECRET || '',
    redirectUri:
      process.env.TOUTIAO_REDIRECT_URI ||
      'http://localhost:5173/oauth/callback/toutiao',
  },
}));
