<template>
  <div class="admin-dashboard">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>钓鱼平台管理</h2>
      </div>
      <nav class="nav-menu">
        <router-link to="/admin/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-tachometer-alt"></i>
          <span>仪表盘</span>
        </router-link>
        <router-link to="/admin/users" class="nav-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/venues" class="nav-item" active-class="active">
          <i class="fas fa-map-marker-alt"></i>
          <span>钓点管理</span>
        </router-link>
        <router-link to="/admin/orders" class="nav-item" active-class="active">
          <i class="fas fa-shopping-cart"></i>
          <span>订单管理</span>
        </router-link>
        <router-link to="/admin/mall" class="nav-item" active-class="active">
          <i class="fas fa-store"></i>
          <span>商城管理</span>
        </router-link>
        <router-link to="/admin/analytics" class="nav-item" active-class="active">
          <i class="fas fa-chart-line"></i>
          <span>数据分析</span>
        </router-link>
        <router-link to="/admin/system" class="nav-item" active-class="active">
          <i class="fas fa-cog"></i>
          <span>系统设置</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <img src="https://via.placeholder.com/40" alt="用户头像">
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser.name }}</div>
            <div class="user-role">{{ currentUser.role }}</div>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          退出登录
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="page-title">{{ currentPageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <div class="notification-bell" @click="toggleNotifications">
            <i class="fas fa-bell"></i>
            <span class="badge" v-if="unreadNotifications">{{ unreadNotifications }}</span>
          </div>
          <div class="system-status">
            <span class="status-dot online"></span>
            <span>系统正常</span>
          </div>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </div>

    <!-- 通知弹窗 -->
    <div v-if="showNotifications" class="notification-popup" @click="hideNotifications">
      <div class="notification-content" @click.stop>
        <div class="notification-header">
          <h3>系统通知</h3>
          <button @click="hideNotifications" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="notification-list">
          <div v-for="notification in notifications" :key="notification.id" class="notification-item">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-body">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    const sidebarCollapsed = ref(false)
    const showNotifications = ref(false)
    
    const currentUser = ref({
      name: '管理员',
      role: '超级管理员',
      email: 'admin@fishing-platform.com'
    })

    const notifications = ref([
      {
        id: 1,
        title: '新用户注册',
        message: '有5个新用户注册，请审核',
        created_at: new Date(),
        read: false
      },
      {
        id: 2,
        title: '系统更新',
        message: '系统将在今晚22:00进行维护更新',
        created_at: new Date(Date.now() - 3600000),
        read: false
      },
      {
        id: 3,
        title: '订单异常',
        message: '发现3个异常订单，请及时处理',
        created_at: new Date(Date.now() - 7200000),
        read: true
      }
    ])

    const currentPageTitle = computed(() => {
      const route = router.currentRoute.value
      const titles = {
        '/admin/dashboard': '仪表盘',
        '/admin/users': '用户管理',
        '/admin/venues': '钓点管理',
        '/admin/orders': '订单管理',
        '/admin/mall': '商城管理',
        '/admin/analytics': '数据分析',
        '/admin/system': '系统设置'
      }
      return titles[route.path] || '管理后台'
    })

    const unreadNotifications = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
    }

    const hideNotifications = () => {
      showNotifications.value = false
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
      
      return date.toLocaleDateString()
    }

    const logout = () => {
      if (confirm('确定要退出登录吗？')) {
        // 清除登录状态
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        
        // 跳转到登录页
        router.push('/admin/login')
      }
    }

    onMounted(() => {
      // 检查登录状态
      const token = localStorage.getItem('admin_token')
      if (!token) {
        router.push('/admin/login')
      }
    })

    return {
      currentUser,
      sidebarCollapsed,
      showNotifications,
      notifications,
      unreadNotifications,
      currentPageTitle,
      toggleSidebar,
      toggleNotifications,
      hideNotifications,
      formatTime,
      logout
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.sidebar.collapsed {
  width: 60px;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #34495e;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  color: #ecf0f1;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: #34495e;
  color: white;
}

.nav-item.active {
  background-color: #3498db;
  color: white;
}

.nav-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #34495e;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  margin-right: 10px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: bold;
  font-size: 14px;
  color: #ecf0f1;
}

.user-role {
  font-size: 12px;
  color: #bdc3c7;
}

.logout-btn {
  width: 100%;
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.logout-btn i {
  margin-right: 8px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-right: 15px;
  color: #7f8c8d;
}

.page-title {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  color: #7f8c8d;
  font-size: 18px;
}

.notification-bell:hover {
  color: #3498db;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #27ae60;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #27ae60;
  margin-right: 5px;
}

.status-dot.online {
  background-color: #27ae60;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.notification-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.notification-content {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-header {
  padding: 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #7f8c8d;
}

.notification-list {
  padding: 0;
}

.notification-item {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.notification-body {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 5px;
}

.notification-time {
  color: #bdc3c7;
  font-size: 12px;
}
</style>