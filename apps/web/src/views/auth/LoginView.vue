<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const { login, loading, error } = useAuth()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const formErrors = reactive({
  email: '',
  password: '',
})

function validate(): boolean {
  let valid = true
  formErrors.email = ''
  formErrors.password = ''

  if (!form.email.trim()) {
    formErrors.email = '请输入邮箱地址'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    formErrors.email = '请输入有效的邮箱地址'
    valid = false
  }

  if (!form.password) {
    formErrors.password = '请输入密码'
    valid = false
  } else if (form.password.length < 6) {
    formErrors.password = '密码至少需要6个字符'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  try {
    await login(form.email, form.password)
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
          一站式内容管理与多平台发布工具。轻松创作、智能管理、一键分发至各大平台，让内容运营更高效。
        </p>
        <div class="mt-12 flex gap-8">
          <div>
            <div class="text-3xl font-bold">6+</div>
            <div class="text-sm text-white/70 mt-1">支持平台</div>
          </div>
          <div>
            <div class="text-3xl font-bold">10x</div>
            <div class="text-sm text-white/70 mt-1">效率提升</div>
          </div>
          <div>
            <div class="text-3xl font-bold">99.9%</div>
            <div class="text-sm text-white/70 mt-1">稳定运行</div>
          </div>
        </div>
      </div>
      <!-- Decorative circles -->
      <div class="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
      <div class="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/5" />
    </div>

    <!-- Right login form -->
    <div class="flex w-full items-center justify-center px-6 lg:w-1/2 bg-background">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="mb-8 text-center lg:hidden">
          <h1 class="text-2xl font-bold text-foreground">ContentHub</h1>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-foreground">欢迎回来</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            请输入您的账号信息登录
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
                placeholder="输入密码"
                autocomplete="current-password"
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

          <!-- Remember me & Forgot password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <span class="text-sm text-muted-foreground">记住我</span>
            </label>
            <button
              type="button"
              disabled
              class="text-sm text-muted-foreground/50 cursor-not-allowed"
            >
              忘记密码?
            </button>
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
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- Register link -->
        <p class="mt-8 text-center text-sm text-muted-foreground">
          还没有账号？
          <router-link
            to="/register"
            class="font-medium text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer"
          >
            立即注册
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
