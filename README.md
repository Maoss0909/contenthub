# ContentHub - 内容分发工具

一站式内容管理与多平台发布工具。轻松创作、智能管理、一键分发至各大平台，让内容运营更高效。

## 技术栈

### 后端

- **框架**: NestJS 11
- **语言**: TypeScript 6
- **数据库**: PostgreSQL 16 + TypeORM
- **缓存/队列**: Redis 7 + BullMQ
- **对象存储**: MinIO
- **认证**: JWT (Passport)
- **HTTP 客户端**: Axios (@nestjs/axios)

### 前端

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 8
- **UI 组件**: shadcn/ui + Tailwind CSS
- **富文本编辑器**: Tiptap
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios

### 基础设施

- **包管理**: pnpm 10 (Workspace Monorepo)
- **容器化**: Docker / Docker Compose

## 项目结构概览

```
contenthub/
├── apps/
│   ├── server/                    # NestJS 后端
│   │   └── src/
│   │       ├── config/            # 配置文件 (数据库/JWT/MinIO/OAuth)
│   │       ├── common/
│   │       │   └── entities/      # TypeORM 实体 (User/Content/Account/PublishTask)
│   │       └── modules/
│   │           ├── auth/          # 认证模块 (注册/登录/JWT/刷新Token)
│   │           ├── account/       # 账号管理模块 (OAuth绑定/解绑/Token刷新)
│   │           ├── content/       # 内容管理模块 (CRUD/富文本)
│   │           ├── publish/       # 发布模块 (发布任务/队列/适配器/预检查)
│   │           ├── dashboard/     # 仪表盘模块 (统计/活动/趋势)
│   │           ├── upload/        # 上传模块 (MinIO文件上传)
│   │           └── queue/         # 队列模块 (BullMQ配置)
│   └── web/                       # Vue 3 前端
│       └── src/
│           ├── components/        # 组件 (编辑器/对话框/卡片等)
│           ├── composables/       # 组合式函数
│           ├── services/          # API 服务层
│           ├── stores/            # Pinia 状态管理
│           ├── types/             # TypeScript 类型定义
│           └── views/             # 页面视图
├── docker/
│   └── docker-compose.yml         # 基础设施容器编排
├── .env.example                   # 环境变量示例
├── package.json                   # 根 package.json (Monorepo 脚本)
└── pnpm-workspace.yaml            # pnpm 工作区配置
```

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Docker (用于启动 PostgreSQL、Redis、MinIO)

### 1. 克隆项目

```bash
git clone <repository-url>
cd contenthub
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

根据实际情况修改 `.env` 中的配置项（数据库、Redis、MinIO、JWT 密钥、OAuth 配置等）。

### 3. 启动基础设施

```bash
docker compose -f docker/docker-compose.yml up -d
```

这将启动以下服务：

| 服务 | 端口 | 说明 |
|------|------|------|
| PostgreSQL | 5432 | 主数据库 |
| Redis | 6379 | 缓存和消息队列 |
| MinIO API | 9000 | 对象存储 API |
| MinIO Console | 9001 | 对象存储管理界面 |

### 4. 安装依赖

```bash
pnpm install
```

### 5. 启动开发服务

```bash
pnpm dev
```

此命令会同时启动前端和后端开发服务器：

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000

## API 文档说明

后端采用 NestJS RESTful 风格，所有接口（除登录/注册外）需要 JWT 认证。

### 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/refresh` | 刷新 Token |
| GET | `/auth/profile` | 获取个人信息 |
| PUT | `/auth/profile` | 更新个人信息 |
| POST | `/auth/change-password` | 修改密码 |

### 内容管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/contents` | 获取内容列表 (分页/搜索/筛选) |
| POST | `/contents` | 创建内容 |
| GET | `/contents/:id` | 获取内容详情 |
| PUT | `/contents/:id` | 更新内容 |
| DELETE | `/contents/:id` | 删除内容 |

### 账号管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/accounts` | 获取绑定账号列表 |
| GET | `/accounts/status` | 批量获取授权状态 |
| GET | `/accounts/platforms` | 获取支持的平台列表 |
| POST | `/accounts/bind/:platform` | 发起 OAuth 绑定 |
| GET | `/accounts/callback/:platform` | OAuth 回调 (公开) |
| DELETE | `/accounts/:id` | 解绑账号 |
| POST | `/accounts/:id/refresh-token` | 手动刷新 Token |

### 发布管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/publish` | 创建发布任务 |
| GET | `/publish/tasks` | 获取发布任务列表 |
| GET | `/publish/tasks/:id` | 获取任务详情 |
| POST | `/publish/tasks/:id/retry` | 重试失败任务 |
| POST | `/publish/tasks/:id/cancel` | 取消待发布任务 |
| GET | `/publish/preview/:platform` | 预览平台适配结果 |
| POST | `/publish/pre-check` | 发布预检查 |
| GET | `/publish/history` | 发布历史 |

### 仪表盘

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dashboard/stats` | 获取统计数据 |
| GET | `/dashboard/recent-activities` | 获取最近活动 |
| GET | `/dashboard/publish-trends` | 获取发布趋势 (近30天) |

### 文件上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/upload/image` | 上传图片 |

## 环境变量说明

### 数据库配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DB_HOST` | 数据库主机 | `localhost` |
| `DB_PORT` | 数据库端口 | `5432` |
| `DB_USERNAME` | 数据库用户名 | `contenthub` |
| `DB_PASSWORD` | 数据库密码 | `contenthub123` |
| `DB_DATABASE` | 数据库名称 | `contenthub` |
| `DB_SYNCHRONIZE` | 是否自动同步表结构 | `false` |
| `DB_LOGGING` | 是否开启 SQL 日志 | `false` |

### Redis 配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `REDIS_HOST` | Redis 主机 | `localhost` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | Redis 密码 | (空) |

### MinIO 配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `MINIO_ENDPOINT` | MinIO 主机 | `localhost` |
| `MINIO_PORT` | MinIO API 端口 | `9000` |
| `MINIO_ACCESS_KEY` | Access Key | `minioadmin` |
| `MINIO_SECRET_KEY` | Secret Key | `minioadmin123` |
| `MINIO_BUCKET` | 存储桶名称 | `contenthub` |
| `MINIO_USE_SSL` | 是否启用 SSL | `false` |

### JWT 配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_SECRET` | JWT 签名密钥 | (需修改) |
| `JWT_EXPIRES_IN` | Access Token 过期时间 | `7d` |
| `JWT_REFRESH_SECRET` | Refresh Token 签名密钥 | (需修改) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token 过期时间 | `30d` |

### OAuth 配置

| 变量名 | 说明 |
|--------|------|
| `WECHAT_CLIENT_ID` | 微信公众号 AppID |
| `WECHAT_CLIENT_SECRET` | 微信公众号 AppSecret |
| `WECHAT_REDIRECT_URI` | 微信 OAuth 回调地址 |
| `TOUTIAO_CLIENT_ID` | 头条号 Client ID |
| `TOUTIAO_CLIENT_SECRET` | 头条号 Client Secret |
| `TOUTIAO_REDIRECT_URI` | 头条 OAuth 回调地址 |

### 应用配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 后端服务端口 | `3000` |
| `NODE_ENV` | 运行环境 | `development` |
| `FRONTEND_URL` | 前端地址 (OAuth 回调跳转) | `http://localhost:5173` |
