<template>
  <header class="app-header">
    <div class="app-header__left">
      <button class="app-header__location" @click="handleLocation">
        📍 {{ location }}
      </button>
    </div>
    <div class="app-header__center">
      <div class="app-header__search">
        <svg class="app-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input
          type="search"
          class="app-header__search-input"
          placeholder="搜索钓点、商品、钓友..."
          @input="handleSearch"
        />
      </div>
    </div>
    <div class="app-header__right">
      <button class="app-header__action" @click="handleNotification">
        🔔
        <span v-if="notificationCount > 0" class="app-header__badge">
          {{ notificationCount }}
        </span>
      </button>
      <button class="app-header__action" @click="handleMessage">
        💬
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const location = ref('厦门市')
const notificationCount = ref(3)

const handleLocation = () => {
  console.log('切换位置')
}

const handleSearch = (event: Event) => {
  const input = event.target as HTMLInputElement
  console.log('搜索:', input.value)
  // TODO: 实现搜索功能
}

const handleNotification = () => {
  console.log('查看通知')
  // TODO: 实现通知功能
}

const handleMessage = () => {
  router.push('/profile/messages')
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.app-header__left {
  flex: 0 0 auto;
}

.app-header__location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 1rem;
  background: #F5F5F7;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.app-header__location:hover {
  background: #E5E7EB;
  border-color: #D1D5DB;
}

.app-header__center {
  flex: 1;
  padding: 0 1rem;
}

.app-header__search {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #F5F5F7;
  border-radius: 1.25rem;
  transition: all 0.2s;
}

.app-header__search:focus-within {
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.app-header__search-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: #9CA3AF;
  margin-right: 0.5rem;
}

.app-header__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: #1F2937;
  font-weight: 400;
}

.app-header__search-input::placeholder {
  color: #9CA3AF;
}

.app-header__right {
  display: flex;
  gap: 0.75rem;
}

.app-header__action {
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F5F5F7;
  font-size: 1.25rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.app-header__action:hover {
  background: #E5E7EB;
  border-color: #D1D5DB;
}

.app-header__badge {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.25rem;
  background: #EF4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 9999px;
}

/* Responsive */
@media (max-width: 768px) {
  .app-header__location {
    font-size: 0.75rem;
  }
  
  .app-header__search {
    padding: 0.375rem 0.625rem;
  }
  
  .app-header__search-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .app-header__search-input {
    font-size: 0.8125rem;
  }
  
  .app-header__action {
    width: 2rem;
    height: 2rem;
    font-size: 1.125rem;
  }
}
</style>
