<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总用户数</div>
              <div class="stat-value">{{ dashboardStats.totalUsers || 0 }}</div>
              <div class="stat-trend positive">
                <span>今日新增: {{ dashboardStats.newUsersToday || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon venue-icon">
              <el-icon><Location /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">钓点总数</div>
              <div class="stat-value">{{ dashboardStats.totalVenues || 0 }}</div>
              <div class="stat-trend">
                <span>活跃钓点: {{ dashboardStats.activeVenues || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon order-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">今日订单</div>
              <div class="stat-value">{{ dashboardStats.todayOrders || 0 }}</div>
              <div class="stat-trend">
                <span>待处理: {{ dashboardStats.pendingOrders || 0 }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon revenue-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">今日收入</div>
              <div class="stat-value">¥{{ formatCurrency(dashboardStats.todayRevenue || 0) }}</div>
              <div class="stat-trend positive">
                <span>+{{ dashboardStats.revenueGrowth || 0 }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-radio-group v-model="userGrowthPeriod" @change="loadUserGrowthData">
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
                <el-radio-button label="90">近90天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="userGrowthChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单统计</span>
              <el-button type="primary" size="small" @click="refreshOrderStats">
                <el-icon><Refresh /></el-icon> 刷新
              </el-button>
            </div>
          </template>
          <div ref="orderChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最新活动 -->
    <el-row :gutter="20" class="activity-row">
      <el-col :span="12">
        <el-card class="activity-card">
          <template #header>
            <span>最新用户活动</span>
          </template>
          <el-table :data="recentActivities.users" style="width: 100%">
            <el-table-column prop="nickname" label="用户名" width="120" />
            <el-table-column prop="activity" label="活动" />
            <el-table-column prop="time" label="时间" width="120" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="activity-card">
          <template #header>
            <span>系统通知</span>
          </template>
          <div class="notification-list">
            <div v-for="notification in recentNotifications" :key="notification.id" 
                 class="notification-item" :class="notification.type">
              <div class="notification-header">
                <el-tag :type="getNotificationType(notification.type)" size="small">
                  {{ notification.category }}
                </el-tag>
                <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
              </div>
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-content">{{ notification.message }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 热门钓点 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="venue-card">
          <template #header>
            <div class="card-header">
              <span>热门钓点排行</span>
              <el-button type="primary" size="small" @click="$router.push('/admin/venues/list')">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <el-table :data="popularVenues" style="width: 100%">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="venue_name" label="钓点名称" width="200" />
            <el-table-column prop="city" label="城市" width="100" />
            <el-table-column prop="venue_score" label="评分" width="80">
              <template #default="scope">
                <el-rate v-model="scope.row.venue_score" disabled />
              </template>
            </el-table-column>
            <el-table-column prop="online_count" label="在线人数" width="100" />
            <el-table-column prop="favorite_count" label="收藏数" width="100" />
            <el-table-column prop="fishing_count" label="在钓人数" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewVenueDetail(scope.row.venue_id)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  User, Location, ShoppingCart, Money, Refresh, ArrowRight
} from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    User, Location, ShoppingCart, Money, Refresh, ArrowRight
  },
  setup() {
    const router = useRouter()
    
    const dashboardStats = reactive({
      totalUsers: 0,
      newUsersToday: 0,
      totalVenues: 0,
      activeVenues: 0,
      todayOrders: 0,
      pendingOrders: 0,
      todayRevenue: 0,
      revenueGrowth: 0
    })
    
    const userGrowthPeriod = ref('7')
    const recentActivities = reactive({
      users: [],
      venues: []
    })
    
    const recentNotifications = ref([
      {
        id: 1,
        title: '新用户注册量激增',
        message: '今日新增用户128人，较昨日增长45%',
        category: '用户',
        type: 'success',
        created_at: new Date()
      },
      {
        id: 2,
        title: '商品库存预警',
        message: '商品"XX品牌钓竿"库存不足，请及时补货',
        category: '商城',
        type: 'warning',
        created_at: new Date(Date.now() - 3600000)
      },
      {
        id: 3,
        title: '钓点举报待处理',
        message: '有3个钓点举报信息需要处理',
        category: '钓点',
        type: 'danger',
        created_at: new Date(Date.now() - 7200000)
      }
    ])
    
    const popularVenues = ref([])
    const userGrowthChart = ref(null)
    const orderChart = ref(null)
    
    const formatCurrency = (value) => {
      return value.toLocaleString('zh-CN')
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
    
    const getNotificationType = (type) => {
      const types = {
        success: 'success',
        warning: 'warning',
        danger: 'danger',
        info: 'info'
      }
      return types[type] || 'info'
    }
    
    const loadDashboardStats = async () => {
      try {
        // 调用各种API获取统计数据
        await Promise.all([
          loadUserStats(),
          loadVenueStats(),
          loadOrderStats(),
          loadRevenueStats()
        ])
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    }
    
    const loadUserStats = async () => {
      try {
        // 模拟调用用户统计API
        // const response = await fetch('/api/users/stats')
        // const data = await response.json()
        
        // 使用模拟数据
        dashboardStats.totalUsers = 12345
        dashboardStats.newUsersToday = 128
      } catch (error) {
        console.error('加载用户统计失败:', error)
      }
    }
    
    const loadVenueStats = async () => {
      try {
        // 模拟调用钓点统计API
        // const response = await fetch('/api/venues/stats')
        // const data = await response.json()
        
        dashboardStats.totalVenues = 256
        dashboardStats.activeVenues = 198
        
        // 加载热门钓点
        popularVenues.value = [
          {
            venue_id: 'venue_001',
            venue_name: '厦门同安水库',
            city: '厦门',
            venue_score: 4.8,
            online_count: 45,
            favorite_count: 1200,
            fishing_count: 23
          },
          {
            venue_id: 'venue_002',
            venue_name: '五缘湾湿地公园',
            city: '厦门',
            venue_score: 4.6,
            online_count: 38,
            favorite_count: 980,
            fishing_count: 18
          },
          {
            venue_id: 'venue_003',
            venue_name: '筼筜湖',
            city: '厦门',
            venue_score: 4.5,
            online_count: 32,
            favorite_count: 850,
            fishing_count: 15
          },
          {
            venue_id: 'venue_004',
            venue_name: '杏林湾水库',
            city: '厦门',
            venue_score: 4.4,
            online_count: 28,
            favorite_count: 720,
            fishing_count: 12
          },
          {
            venue_id: 'venue_005',
            venue_name: '海沧湖',
            city: '厦门',
            venue_score: 4.3,
            online_count: 25,
            favorite_count: 650,
            fishing_count: 10
          }
        ]
      } catch (error) {
        console.error('加载钓点统计失败:', error)
      }
    }
    
    const loadOrderStats = async () => {
      try {
        // 模拟调用订单统计API
        // const response = await fetch('/api/mall/orders/stats')
        // const data = await response.json()
        
        dashboardStats.todayOrders = 156
        dashboardStats.pendingOrders = 23
      } catch (error) {
        console.error('加载订单统计失败:', error)
      }
    }
    
    const loadRevenueStats = async () => {
      try {
        // 模拟调用收入统计API
        // const response = await fetch('/api/mall/revenue/stats')
        // const data = await response.json()
        
        dashboardStats.todayRevenue = 25800
        dashboardStats.revenueGrowth = 12.5
      } catch (error) {
        console.error('加载收入统计失败:', error)
      }
    }
    
    const loadUserGrowthData = async () => {
      try {
        // 模拟调用用户增长API
        // const response = await fetch(`/api/users/growth?days=${userGrowthPeriod.value}`)
        // const data = await response.json()
        
        // 使用模拟数据
        const days = parseInt(userGrowthPeriod.value)
        const chartData = []
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          chartData.push({
            date: date.toLocaleDateString('zh-CN'),
            totalUsers: 12000 + Math.random() * 500,
            newUsers: Math.floor(Math.random() * 100) + 50
          })
        }
        
        await nextTick()
        renderUserGrowthChart(chartData)
      } catch (error) {
        console.error('加载用户增长数据失败:', error)
      }
    }
    
    const renderUserGrowthChart = (data) => {
      const chartDom = userGrowthChart.value
      if (!chartDom) return
      
      const chart = echarts.init(chartDom)
      const option = {
        title: {
          text: '用户增长趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['总用户数', '新增用户']
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.date)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '总用户数',
            type: 'line',
            data: data.map(item => item.totalUsers),
            smooth: true,
            areaStyle: {}
          },
          {
            name: '新增用户',
            type: 'bar',
            data: data.map(item => item.newUsers)
          }
        ]
      }
      chart.setOption(option)
    }
    
    const renderOrderChart = () => {
      const chartDom = orderChart.value
      if (!chartDom) return
      
      const chart = echarts.init(chartDom)
      const option = {
        title: {
          text: '订单状态分布'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1048, name: '已完成' },
              { value: 735, name: '待支付' },
              { value: 580, name: '已发货' },
              { value: 484, name: '待处理' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option)
    }
    
    const refreshOrderStats = async () => {
      await loadOrderStats()
      await nextTick()
      renderOrderChart()
    }
    
    const viewVenueDetail = (venueId) => {
      router.push(`/admin/venues/detail/${venueId}`)
    }
    
    onMounted(async () => {
      await loadDashboardStats()
      await loadUserGrowthData()
      await nextTick()
      renderOrderChart()
      
      // 模拟加载最近用户活动
      recentActivities.users = [
        {
          nickname: '钓友小明',
          activity: '注册成为新用户',
          time: '2分钟前'
        },
        {
          nickname: '钓鱼达人',
          activity: '发布了新的钓点评价',
          time: '5分钟前'
        },
        {
          nickname: '老钓手',
          activity: '购买了商品"XX钓竿"',
          time: '8分钟前'
        },
        {
          nickname: '新手钓友',
          activity: '收藏了钓点"同安水库"',
          time: '12分钟前'
        },
        {
          nickname: '专业钓手',
          activity: '加入了钓点聊天室',
          time: '15分钟前'
        }
      ]
    })
    
    return {
      dashboardStats,
      userGrowthPeriod,
      recentActivities,
      recentNotifications,
      popularVenues,
      userGrowthChart,
      orderChart,
      formatCurrency,
      formatTime,
      getNotificationType,
      refreshOrderStats,
      viewVenueDetail
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-right: 16px;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.venue-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.order-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.revenue-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  color: #999;
}

.stat-trend.positive {
  color: #67c23a;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-row {
  margin-bottom: 20px;
}

.activity-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f5f5;
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
}

.venue-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>