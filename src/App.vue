<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <AppHeader v-if="!isLoginPage" />
    <main class="pb-20">
      <router-view />
    </main>
    <AppBottomNav v-if="!isLoginPage" />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppBottomNav from './components/layout/AppBottomNav.vue'
import AppFooter from './components/layout/AppFooter.vue'

const route = useRoute()

const isLoginPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
