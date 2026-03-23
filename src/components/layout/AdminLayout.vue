<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside width="250px" class="sidebar">
      <div class="logo">
        <h2>钓鱼平台管理后台</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表板</span>
        </el-menu-item>
        
        <el-sub-menu index="users">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users/list">用户列表</el-menu-item>
          <el-menu-item index="/admin/users/stats">用户统计</el-menu-item>
          <el-menu-item index="/admin/users/level">用户等级</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="venues">
          <template #title>
            <el-icon><Location /></el-icon>
            <span>钓点管理</span>
          </template>
          <el-menu-item index="/admin/venues/list">钓点列表</el-menu-item>
          <el-menu-item index="/admin/venues/recommended">推荐管理</el-menu-item>
          <el-menu-item index="/admin/venues/categories">分类管理</el-menu-item>
          <el-menu-item index="/admin/venues/reports">举报管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="mall">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>商城管理</span>
          </template>
          <el-menu-item index="/admin/mall/products">商品管理</el-menu-item>
          <el-menu-item index="/admin/mall/orders">订单管理</el-menu-item>
          <el-menu-item index="/admin/mall/secondhand">二手商品</el-menu-item>
          <el-menu-item index="/admin/mall/repair">维修服务</el-menu-item>
          <el-menu-item index="/admin/mall/categories">商品分类</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="content">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/admin/content/posts">帖子管理</el-menu-item>
          <el-menu-item index="/admin/content/comments">评论管理</el-menu-item>
          <el-menu-item index="/admin/content/reports">内容审核</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admin/system/config">系统配置</el-menu-item>
          <el-menu-item index="/admin/system/logs">系统日志</el-menu-item>
          <el-menu-item index="/admin/system/backup">数据备份</el-menu-item>
        </el-sub-menu>
      </el-menu>
      
      <div class="sidebar-footer">
        <div class="admin-info">
          <el-avatar :size="32" :src="adminInfo.avatar_url" />
          <div class="admin-details">
            <div class="admin-name">{{ adminInfo.nickname }}</div>
            <div class="admin-role">超级管理员</div>
          </div>
        </div>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </el-aside>
    
    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button text @click="toggleSidebar">
            <el-icon><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-badge :value="unreadCount" class="notification-badge">
            <el-button circle @click="showNotifications = true">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          
          <el-dropdown @command="handleUserMenu">
            <div class="user-dropdown">
              <el-avatar :size="32" :src="adminInfo.avatar_url" />
              <span class="username">{{ adminInfo.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">账号设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 页面内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
    
    <!-- 通知弹窗 -->
    <el-drawer
      v-model="showNotifications"
      title="系统通知"
      direction="rtl"
      size="400px"
    >
      <div class="notification-list">
        <div v-for="notification in notifications" :key="notification.id" 
             class="notification-item" 
             :class="{ unread: !notification.read }">
          <div class="notification-header">
            <el-tag size="small" :type="notification.type">{{ notification.category }}</el-tag>
            <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
          </div>
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-content">{{ notification.message }}</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataLine, User, Location, Shop, Document, Setting,
  Bell, ArrowDown, Fold, Expand
} from '@element-plus/icons-vue'

export default {
  name: 'AdminLayout',
  components: {
    DataLine, User, Location, Shop, Document, Setting,
    Bell, ArrowDown, Fold, Expand
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const sidebarCollapsed = ref(false)
    const showNotifications = ref(false)
    
    const adminInfo = ref({
      user_id: 'admin_001',
      nickname: '管理员',
      avatar_url: 'https://via.placeholder.com/100',
      phone_number: '13800138000',
      user_level: 5
    })
    
    const notifications = ref([
      {
        id: 1,
        title: '新用户注册',
        message: '有5个新用户注册，请及时审核',
        category: '用户',
        type: 'success',
        created_at: new Date(),
        read: false
      },
      {
        id: 2,
        title: '商品库存预警',
        message: '商品"XX钓竿"库存不足，请及时补货',
        category: '商城',
        type: 'warning',
        created_at: new Date(Date.now() - 3600000),
        read: false
      },
      {
        id: 3,
        title: '订单异常',
        message: '订单#20240320001支付异常，请处理',
        category: '订单',
        type: 'danger',
        created_at: new Date(Date.now() - 7200000),
        read: true
      }
    ])
    
    const activeMenu = computed(() => route.path)
    
    const currentPageTitle = computed(() => {
      const titles = {
        '/admin/dashboard': '仪表板',
        '/admin/users/list': '用户列表',
        '/admin/users/stats': '用户统计',
        '/admin/venues/list': '钓点列表',
        '/admin/mall/products': '商品管理',
        '/admin/mall/orders': '订单管理',
        '/admin/system/config': '系统配置'
      }
      return titles[route.path] || '管理后台'
    })
    
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    
    const formatTime = (date) => {
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return date.toLocaleDateString('zh-CN')
    }
    
    const handleUserMenu = (command) => {
      if (command === 'profile') {
        router.push('/admin/profile')
      } else if (command === 'settings') {
        router.push('/admin/settings')
      } else if (command === 'logout') {
        handleLogout()
      }
    }
    
    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 清除登录状态
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        
        // 跳转到登录页
        router.push('/admin/login')
        
        ElMessage.success('退出登录成功')
      } catch {
        // 用户取消操作
      }
    }
    
    onMounted(() => {
      // 检查登录状态
      const token = localStorage.getItem('admin_token')
      if (!token) {
        router.push('/admin/login')
      }
      
      // 加载管理员信息
      loadAdminInfo()
    })
    
    const loadAdminInfo = async () => {
      try {
        // 调用API获取当前用户信息
        // const response = await fetch('/api/auth/me', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        //   }
        // })
        // const data = await response.json()
        // adminInfo.value = data.user
      } catch (error) {
        console.error('加载管理员信息失败:', error)
      }
    }
    
    return {
      adminInfo,
      sidebarCollapsed,
      showNotifications,
      notifications,
      activeMenu,
      currentPageTitle,
      unreadCount,
      toggleSidebar,
      formatTime,
      handleUserMenu,
      handleLogout
    }
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  display: flex;
}

.sidebar {
  background-color: #304156;
  color: #bfcbd9;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #263445;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #263445;
}

.admin-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.admin-details {
  margin-left: 10px;
}

.admin-name {
  font-size: 14px;
  color: #fff;
  font-weight: bold;
}

.admin-role {
  font-size: 12px;
  color: #bfcbd9;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  cursor: pointer;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}

.notification-list {
  padding: 0;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.notification-content {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}
</style>