<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const { register, loading, error } = useAuth()

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const formErrors = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

function validate(): boolean {
  let valid = true
  formErrors.email = ''
  formErrors.username = ''
  formErrors.password = ''
  formErrors.confirmPassword = ''

  if (!form.email.trim()) {
    formErrors.email = '请输入邮箱地址'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    formErrors.email = '请输入有效的邮箱地址'
    valid = false
  }

  if (!form.username.trim()) {
    formErrors.username = '请输入用户名'
    valid = false
  } else if (form.username.trim().length < 2) {
    formErrors.username = '用户名至少需要2个字符'
    valid = false
  }

  if (!form.password) {
    formErrors.password = '请输入密码'
    valid = false
  } else if (form.password.length < 6) {
    formErrors.password = '密码至少需要6个字符'
    valid = false
  }

  if (!form.confirmPassword) {
    formErrors.confirmPassword = '请确认密码'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    formErrors.confirmPassword = '两次输入的密码不一致'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  try {
    await register(form.email, form.password, form.username)
  } catch {
    // error is handled in useAuth
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left brand panel -->
    <div
      class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700"
    >
      <div class="absolute inset-0 bg-black/10" />
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div class="mb-8">
          <h1 class="text-4xl font-bold tracking-tight mb-2">ContentHub</h1>
          <div class="h-1 w-16 rounded bg-white/60" />
        </div>
        <p class="text-lg leading-relaxed text-white/90 max-w-md">
          加入 ContentHub，开启高效内容管理之旅。支持多平台一键发布，让您的创作触达更多受众。
        </p>
        <div class="mt-12 space-y-4">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-white/90">多平台内容管理</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-white/90">智能定时发布</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-white/90">数据分析与洞察</span>
          </div>
        </div>
      </div>
      <div class="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
      <div class="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/5" />
    </div>

    <!-- Right register form -->
    <div class="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 bg-background">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="mb-8 text-center lg:hidden">
          <h1 class="text-2xl font-bold text-foreground">ContentHub</h1>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-foreground">创建账号</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            填写以下信息注册新账号
          </p>
        </div>

        <!-- Error message -->
        <div
          v-if="error"
          class="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {{ error }}
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <!-- Email -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground" for="email">
              邮箱地址
            </label>
            <div class="relative">
              <Mail
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                autocomplete="email"
                class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ 'border-destructive focus:ring-destructive': formErrors.email }"
              />
            </div>
            <p v-if="formErrors.email" class="text-xs text-destructive">
              {{ formErrors.email }}
            </p>
          </div>

          <!-- Username -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground" for="username">
              用户名
            </label>
            <div class="relative">
              <User
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="输入用户名"
                autocomplete="username"
                class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ 'border-destructive focus:ring-destructive': formErrors.username }"
              />
            </div>
            <p v-if="formErrors.username" class="text-xs text-destructive">
              {{ formErrors.username }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground" for="password">
              密码
            </label>
            <div class="relative">
              <Lock
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="输入密码 (至少6位)"
                autocomplete="new-password"
                class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ 'border-destructive focus:ring-destructive': formErrors.password }"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
            <p v-if="formErrors.password" class="text-xs text-destructive">
              {{ formErrors.password }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground" for="confirmPassword">
              确认密码
            </label>
            <div class="relative">
              <Lock
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="再次输入密码"
                autocomplete="new-password"
                class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ 'border-destructive focus:ring-destructive': formErrors.confirmPassword }"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
            <p v-if="formErrors.confirmPassword" class="text-xs text-destructive">
              {{ formErrors.confirmPassword }}
            </p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <svg
              v-if="loading"
              class="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <!-- Login link -->
        <p class="mt-8 text-center text-sm text-muted-foreground">
          已有账号？
          <router-link
            to="/login"
            class="font-medium text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer"
          >
            立即登录
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
