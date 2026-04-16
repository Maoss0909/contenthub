import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取统计数据
   */
  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStats(userId);
  }

  /**
   * 获取最近活动
   */
  @Get('recent-activities')
  async getRecentActivities(@CurrentUser('id') userId: string) {
    return this.dashboardService.getRecentActivities(userId);
  }

  /**
   * 获取发布趋势
   */
  @Get('publish-trends')
  async getPublishTrends(@CurrentUser('id') userId: string) {
    return this.dashboardService.getPublishTrends(userId);
  }
}
