import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '../types/user.types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>('')
  const user = ref<UserInfo | null>(null)
  const isAuthenticated = ref<boolean>(false)

  // Getters
  const isLoggedIn = computed(() => {
    return !!token.value && !!user.value
  })

  const userLevel = computed(() => {
    return user.value?.user_level || 1
  })

  const fishDryBalance = computed(() => {
    return user.value?.fish_dry_balance || 0
  })

  // Actions
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(newUser: UserInfo | null) {
    user.value = newUser
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function checkAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    } else {
      isAuthenticated.value = false
    }
  }

  // 初始化检查
  checkAuth()

  return {
    // State
    token,
    user,
    isAuthenticated,
    // Getters
    isLoggedIn,
    userLevel,
    fishDryBalance,
    // Actions
    setToken,
    setUser,
    logout,
    checkAuth
  }
})
