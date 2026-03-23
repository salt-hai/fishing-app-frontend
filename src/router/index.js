import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/components/views/DashboardPage.vue')
      },
      {
        path: 'dashboard',
        name: 'DashboardPage',
        component: () => import('@/components/views/DashboardPage.vue')
      },
      // 用户管理路由
      {
        path: 'users',
        name: 'Users',
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/components/views/users/UserListPage.vue')
          },
          {
            path: 'stats',
            name: 'UserStats',
            component: () => import('@/components/views/users/UserStatsPage.vue')
          },
          {
            path: 'level',
            name: 'UserLevel',
            component: () => import('@/components/views/users/UserLevelPage.vue')
          }
        ]
      },
      // 钓点管理路由
      {
        path: 'venues',
        name: 'Venues',
        children: [
          {
            path: 'list',
            name: 'VenueList',
            component: () => import('@/components/views/venues/VenueListPage.vue')
          },
          {
            path: 'recommended',
            name: 'VenueRecommended',
            component: () => import('@/components/views/venues/VenueRecommendedPage.vue')
          },
          {
            path: 'categories',
            name: 'VenueCategories',
            component: () => import('@/components/views/venues/VenueCategoriesPage.vue')
          },
          {
            path: 'reports',
            name: 'VenueReports',
            component: () => import('@/components/views/venues/VenueReportsPage.vue')
          }
        ]
      },
      // 商城管理路由
      {
        path: 'mall',
        name: 'Mall',
        children: [
          {
            path: 'products',
            name: 'MallProducts',
            component: () => import('@/components/views/mall/MallProductsPage.vue')
          },
          {
            path: 'orders',
            name: 'MallOrders',
            component: () => import('@/components/views/mall/MallOrdersPage.vue')
          },
          {
            path: 'secondhand',
            name: 'MallSecondHand',
            component: () => import('@/components/views/mall/MallSecondHandPage.vue')
          },
          {
            path: 'repair',
            name: 'MallRepair',
            component: () => import('@/components/views/mall/MallRepairPage.vue')
          },
          {
            path: 'categories',
            name: 'MallCategories',
            component: () => import('@/components/views/mall/MallCategoriesPage.vue')
          }
        ]
      },
      // 内容管理路由
      {
        path: 'content',
        name: 'Content',
        children: [
          {
            path: 'posts',
            name: 'ContentPosts',
            component: () => import('@/components/views/content/ContentPostsPage.vue')
          },
          {
            path: 'comments',
            name: 'ContentComments',
            component: () => import('@/components/views/content/ContentCommentsPage.vue')
          },
          {
            path: 'reports',
            name: 'ContentReports',
            component: () => import('@/components/views/content/ContentReportsPage.vue')
          }
        ]
      },
      // 系统设置路由
      {
        path: 'system',
        name: 'System',
        children: [
          {
            path: 'config',
            name: 'SystemConfig',
            component: () => import('@/components/views/system/SystemConfigPage.vue')
          },
          {
            path: 'logs',
            name: 'SystemLogs',
            component: () => import('@/components/views/system/SystemLogsPage.vue')
          },
          {
            path: 'backup',
            name: 'SystemBackup',
            component: () => import('@/components/views/system/SystemBackupPage.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/components/views/AdminLoginPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/admin'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  
  // 如果访问的是登录页，且已登录，重定向到首页
  if (to.path === '/admin/login' && token) {
    next('/admin')
    return
  }
  
  // 如果访问的不是登录页，且未登录，重定向到登录页
  if (to.path !== '/admin/login' && !token) {
    next('/admin/login')
    return
  }
  
  next()
})

export default router