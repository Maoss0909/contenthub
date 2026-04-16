import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: '仪表盘' },
  },
  {
    path: '/contents',
    name: 'content-list',
    component: () => import('@/views/content/ContentListView.vue'),
    meta: { title: '内容管理' },
  },
  {
    path: '/contents/create',
    name: 'content-create',
    component: () => import('@/views/content/ContentCreateView.vue'),
    meta: { title: '创建内容' },
  },
  {
    path: '/contents/:id/edit',
    name: 'content-edit',
    component: () => import('@/views/content/ContentEditView.vue'),
    meta: { title: '编辑内容' },
  },
  {
    path: '/publish/history',
    name: 'publish-history',
    component: () => import('@/views/publish/PublishHistoryView.vue'),
    meta: { title: '发布记录' },
  },
  {
    path: '/publish/history/:id',
    name: 'publish-detail',
    component: () => import('@/views/publish/PublishDetailView.vue'),
    meta: { title: '发布详情' },
  },
  {
    path: '/accounts',
    name: 'account-list',
    component: () => import('@/views/account/AccountListView.vue'),
    meta: { title: '账号管理' },
  },
  {
    path: '/accounts/bind/:platform',
    name: 'account-bind',
    component: () => import('@/views/account/AccountBindView.vue'),
    meta: { title: '绑定账号' },
  },
]
