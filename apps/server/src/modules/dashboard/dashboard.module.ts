import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../../common/entities/content.entity';
import { Account } from '../../common/entities/account.entity';
import { PublishTask } from '../../common/entities/publish-task.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Content, Account, PublishTask])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
