<template>
  <nav class="app-bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="app-bottom-nav__item"
      :class="{ 'app-bottom-nav__item--active': isActive(item.path) }"
    >
      <span class="app-bottom-nav__icon">{{ item.icon }}</span>
      <span class="app-bottom-nav__label">{{ item.label }}</span>
      <span v-if="item.badge" class="app-bottom-nav__badge">{{ item.badge }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    name: 'home',
    path: '/',
    icon: '🏠',
    label: '首页'
  },
  {
    name: 'venues',
    path: '/venues',
    icon: '🎣',
    label: '钓点'
  },
  {
    name: 'mall',
    path: '/mall',
    icon: '🛒',
    label: '商城'
  },
  {
    name: 'profile',
    path: '/profile',
    icon: '👤',
    label: '我的'
  }
]

const isActive = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
.app-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 1rem;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.app-bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: #9CA3AF;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  gap: 0.125rem;
}

.app-bottom-nav__item:hover {
  color: #6B7280;
}

.app-bottom-nav__item--active {
  color: #007AFF;
}

.app-bottom-nav__icon {
  font-size: 1.5rem;
  line-height: 1;
}

.app-bottom-nav__label {
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
}

.app-bottom-nav__badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  min-width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
  background: #EF4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 9999px;
}
</style>
