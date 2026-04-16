import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Account } from '../../common/entities/account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TokenEncryptService } from './token-encrypt.service';
import { TokenRefreshService } from './token-refresh.service';
import { WechatProvider } from './providers/wechat.provider';
import { ToutiaoProvider } from './providers/toutiao.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), HttpModule],
  controllers: [AccountController],
  providers: [
    AccountService,
    TokenEncryptService,
    TokenRefreshService,
    WechatProvider,
    ToutiaoProvider,
  ],
  exports: [AccountService, TokenEncryptService],
})
export class AccountModule {}
