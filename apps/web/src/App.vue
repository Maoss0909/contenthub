<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const isPublic = computed(() => route.meta.public === true)
</script>

<template>
  <AppLayout v-if="!isPublic" />
  <RouterView v-else />
</template>
