# ContentHub - 内容分发工具

一站式内容管理与多平台发布工具。轻松创作、智能管理、一键分发至各大平台，让内容运营更高效。

## 技术栈

### 后端
- **框架**: NestJS 11 + TypeScript
- **数据库**: PostgreSQL 16 + TypeORM
- **缓存/队列**: Redis 7 + BullMQ
- **对象存储**: MinIO
- **认证**: JWT (Passport)

### 前端
- **框架**: Vue 3 (Composition API) + Vite
- **UI 组件**: shadcn/ui + Tailwind CSS
- **富文本编辑器**: TipTap
- **状态管理**: Pinia + Vue Router

### 基础设施
- **包管理**: pnpm 10 (Workspace Monorepo)
- **容器化**: Docker / Docker Compose

## 快速开始

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm dev
```

## 项目结构

```
contenthub/
├── apps/
│   ├── server/          # NestJS 后端
│   └── web/             # Vue 3 前端
├── docker/               # Docker Compose
└── docs/                 # 文档
```