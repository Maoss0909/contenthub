import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PublishTask } from '../../common/entities/publish-task.entity';
import { Content } from '../../common/entities/content.entity';
import { Account } from '../../common/entities/account.entity';
import { QueueModule } from '../queue/queue.module';
import { PublishService } from './publish.service';
import { FormatAdapterService } from './format-adapter.service';
import { PreCheckService } from './pre-check.service';
import { WechatAdapter } from './adapters/wechat-adapter';
import { ToutiaoAdapter } from './adapters/toutiao-adapter';
import { PublishProcessor } from './publish.processor';
import { PublishController } from './publish.controller';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublishTask, Content, Account]),
    HttpModule,
    forwardRef(() => QueueModule),
    AccountModule,
  ],
  providers: [
    PublishService,
    FormatAdapterService,
    PreCheckService,
    WechatAdapter,
    ToutiaoAdapter,
    PublishProcessor,
  ],
  controllers: [PublishController],
  exports: [PublishService, FormatAdapterService, PreCheckService],
})
export class PublishModule {}
