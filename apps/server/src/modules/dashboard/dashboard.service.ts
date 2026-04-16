import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Content } from '../../common/entities/content.entity';
import { Account } from '../../common/entities/account.entity';
import { PublishTask } from '../../common/entities/publish-task.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(PublishTask)
    private readonly publishTaskRepository: Repository<PublishTask>,
  ) {}

  /**
   * 获取用户统计数据
   */
  async getStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalContent,
      publishedContent,
      boundAccounts,
      monthlyPublished,
    ] = await Promise.all([
      // 用户内容总数
      this.contentRepository.count({
        where: { userId },
      }),
      // 已发布内容数
      this.contentRepository.count({
        where: { userId, status: 'published' as const },
      }),
      // 已绑定账号数
      this.accountRepository.count({
        where: { userId },
      }),
      // 本月发布数（当月已成功的发布任务数）
      this.publishTaskRepository.count({
        where: {
          userId,
          status: 'success' as const,
          publishedAt: Between(startOfMonth, endOfMonth),
        },
      }),
    ]);

    return {
      totalContent,
      publishedContent,
      boundAccounts,
      monthlyPublished,
    };
  }

  /**
   * 获取最近10条活动
   */
  async getRecentActivities(userId: string) {
    // 查询最近的发布任务（取前5条）
    const recentTasks = await this.publishTaskRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['content', 'account'],
    });

    // 查询最近创建的内容（取前5条）
    const recentContents = await this.contentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // 合并并转换为活动格式
    const activities = [
      ...recentTasks.map((task) => ({
        id: task.id,
        type: 'publish_task' as const,
        title: `发布「${task.content?.title || '未知内容'}」到 ${task.platform}`,
        status: task.status,
        createdAt: task.createdAt,
      })),
      ...recentContents.map((content) => ({
        id: content.id,
        type: 'content_created' as const,
        title: `创建内容「${content.title}」`,
        status: content.status,
        createdAt: content.createdAt,
      })),
    ];

    // 按时间倒序排列，取前10条
    activities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return activities.slice(0, 10);
  }

  /**
   * 获取近30天每日发布数
   */
  async getPublishTrends(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 查询近30天已成功的发布任务
    const tasks = await this.publishTaskRepository.find({
      where: {
        userId,
        status: 'success' as const,
        publishedAt: Between(thirtyDaysAgo, now),
      },
      select: ['publishedAt'],
    });

    // 按日期分组统计
    const trendMap = new Map<string, number>();

    // 初始化近30天每一天为0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      trendMap.set(dateStr, 0);
    }

    // 统计每天发布数
    for (const task of tasks) {
      if (task.publishedAt) {
        const dateStr = task.publishedAt.toISOString().split('T')[0];
        trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1);
      }
    }

    // 转换为数组格式
    const trends = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return trends;
  }
}
