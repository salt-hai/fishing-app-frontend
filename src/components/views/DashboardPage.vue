<template>
  <div class="dashboard-page">
    <!-- 概览卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>总用户数</h3>
          <div class="stat-value">{{ dashboardData.user_stats?.total_users || 0 }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +{{ dashboardData.user_stats?.new_users || 0 }} 新用户
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon venues">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="stat-content">
          <h3>钓点总数</h3>
          <div class="stat-value">{{ dashboardData.venue_stats?.total_venues || 0 }}</div>
          <div class="stat-change">
            <span class="active">{{ dashboardData.venue_stats?.active_venues || 0 }} 活跃</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bookings">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>总订单数</h3>
          <div class="stat-value">{{ dashboardData.booking_stats?.total_bookings || 0 }}</div>
          <div class="stat-change">
            <span class="completion">{{ (dashboardData.booking_stats?.completion_rate * 100 || 0).toFixed(1) }}% 完成率</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>总收入</h3>
          <div class="stat-value">¥{{ formatCurrency(dashboardData.revenue_stats?.total_revenue || 0) }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            ¥{{ formatCurrency(dashboardData.revenue_stats?.average_booking_value || 0) }} 平均值
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 用户增长图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>用户增长趋势</h3>
          <div class="chart-controls">
            <select v-model="growthGroupBy" @change="loadUserGrowth">
              <option value="day">按日</option>
              <option value="week">按周</option>
              <option value="month">按月</option>
            </select>
          </div>
        </div>
        <div class="chart-content">
          <canvas ref="userGrowthChart"></canvas>
        </div>
      </div>

      <!-- 收入分析图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>收入分析</h3>
          <div class="chart-controls">
            <select v-model="revenueDays" @change="loadRevenueAnalysis">
              <option value="7">最近7天</option>
              <option value="30">最近30天</option>
              <option value="90">最近90天</option>
            </select>
          </div>
        </div>
        <div class="chart-content">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 场地表现排行 -->
    <div class="venue-performance">
      <div class="section-header">
        <h3>场地表现排行</h3>
        <button class="btn-refresh" @click="loadVenuePerformance">
          <i class="fas fa-sync-alt"></i> 刷新
        </button>
      </div>
      <div class="venue-table">
        <div class="table-header">
          <div class="table-cell">场地名称</div>
          <div class="table-cell">预订数</div>
          <div class="table-cell">收入</div>
          <div class="table-cell">平均价值</div>
          <div class="table-cell">评分</div>
          <div class="table-cell">入住率</div>
        </div>
        <div v-for="venue in venuePerformance" :key="venue.venue_id" class="table-row">
          <div class="table-cell venue-name">
            <div class="venue-info">
              <div class="venue-title">{{ venue.venue_name }}</div>
              <div class="venue-location">{{ venue.location }}</div>
            </div>
          </div>
          <div class="table-cell">{{ venue.bookings }}</div>
          <div class="table-cell">¥{{ formatCurrency(venue.revenue) }}</div>
          <div class="table-cell">¥{{ formatCurrency(venue.average_booking_value) }}</div>
          <div class="table-cell">
            <span class="rating">{{ venue.rating.toFixed(1) }}</span>
          </div>
          <div class="table-cell">
            <span class="occupancy-rate">{{ (venue.occupancy_rate * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <div class="section-header">
        <h3>最近活动</h3>
      </div>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Chart } from 'chart.js/auto'

export default {
  name: 'DashboardPage',
  setup() {
    const dashboardData = reactive({})
    const userGrowthChart = ref(null)
    const revenueChart = ref(null)
    const venuePerformance = ref([])
    const recentActivities = ref([])
    const growthGroupBy = ref('day')
    const revenueDays = ref(30)

    // 最近活动数据
    const activitiesData = [
      {
        id: 1,
        type: 'user',
        title: '新用户注册',
        description: '用户 "张三" 完成了注册',
        timestamp: new Date(Date.now() - 5 * 60000)
      },
      {
        id: 2,
        type: 'booking',
        title: '新预订创建',
        description: '在 "西湖钓场" 创建了新的预订',
        timestamp: new Date(Date.now() - 15 * 60000)
      },
      {
        id: 3,
        type: 'payment',
        title: '支付完成',
        description: '订单 #12345 支付成功',
        timestamp: new Date(Date.now() - 30 * 60000)
      },
      {
        id: 4,
        type: 'venue',
        title: '场地更新',
        description: '"东湖钓场" 更新了场地信息',
        timestamp: new Date(Date.now() - 45 * 60000)
      },
      {
        id: 5,
        type: 'system',
        title: '系统维护',
        description: '系统执行了定期数据备份',
        timestamp: new Date(Date.now() - 60 * 60000)
      }
    ]

    const getActivityIcon = (type) => {
      const icons = {
        user: 'fas fa-user-plus',
        booking: 'fas fa-calendar-plus',
        payment: 'fas fa-credit-card',
        venue: 'fas fa-map-marker-alt',
        system: 'fas fa-cog'
      }
      return icons[type] || 'fas fa-info-circle'
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
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

    const loadDashboardData = async () => {
      try {
        // 模拟API调用
        // const response = await fetch('/api/v1/analytics/dashboard')
        // dashboardData.value = await response.json()
        
        // 使用模拟数据
        dashboardData.user_stats = {
          total_users: 1234,
          new_users: 45,
          active_users: 856
        }
        dashboardData.venue_stats = {
          total_venues: 56,
          active_venues: 48
        }
        dashboardData.booking_stats = {
          total_bookings: 892,
          completed_bookings: 756,
          completion_rate: 0.847
        }
        dashboardData.revenue_stats = {
          total_revenue: 156780,
          average_booking_value: 175.76,
          conversion_rate: 0.085
        }
      } catch (error) {
        console.error('加载仪表板数据失败:', error)
      }
    }

    const loadUserGrowth = async () => {
      try {
        // 模拟API调用
        // const response = await fetch(`/api/v1/analytics/user-growth?group_by=${growthGroupBy.value}`)
        // const data = await response.json()
        
        // 使用模拟数据
        const mockData = {
          data: [
            { date: '2024-01-01', total_users: 1000, new_users: 10 },
            { date: '2024-01-02', total_users: 1015, new_users: 15 },
            { date: '2024-01-03', total_users: 1035, new_users: 20 },
            { date: '2024-01-04', total_users: 1050, new_users: 15 },
            { date: '2024-01-05', total_users: 1070, new_users: 20 },
            { date: '2024-01-06', total_users: 1095, new_users: 25 },
            { date: '2024-01-07', total_users: 1120, new_users: 25 }
          ]
        }
        
        await nextTick()
        renderUserGrowthChart(mockData.data)
      } catch (error) {
        console.error('加载用户增长数据失败:', error)
      }
    }

    const loadRevenueAnalysis = async () => {
      try {
        // 模拟API调用
        // const response = await fetch(`/api/v1/analytics/revenue-analysis?days=${revenueDays.value}`)
        // const data = await response.json()
        
        // 使用模拟数据
        const mockData = {
          daily_data: [
            { date: '2024-01-01', revenue: 2500, bookings: 12, avg_value: 208.33 },
            { date: '2024-01-02', revenue: 3200, bookings: 15, avg_value: 213.33 },
            { date: '2024-01-03', revenue: 2800, bookings: 14, avg_value: 200.00 },
            { date: '2024-01-04', revenue: 3500, bookings: 16, avg_value: 218.75 },
            { date: '2024-01-05', revenue: 2900, bookings: 13, avg_value: 223.08 },
            { date: '2024-01-06', revenue: 4100, bookings: 18, avg_value: 227.78 },
            { date: '2024-01-07', revenue: 3700, bookings: 17, avg_value: 217.65 }
          ]
        }
        
        await nextTick()
        renderRevenueChart(mockData.daily_data)
      } catch (error) {
        console.error('加载收入分析数据失败:', error)
      }
    }

    const loadVenuePerformance = async () => {
      try {
        // 模拟API调用
        // const response = await fetch('/api/v1/analytics/venue-performance')
        // venuePerformance.value = await response.json()
        
        // 使用模拟数据
        venuePerformance.value = [
          {
            venue_id: 1,
            venue_name: '西湖钓场',
            location: '杭州西湖',
            bookings: 89,
            revenue: 17800,
            average_booking_value: 200,
            rating: 4.8,
            occupancy_rate: 0.85
          },
          {
            venue_id: 2,
            venue_name: '东湖钓场',
            location: '武汉东湖',
            bookings: 76,
            revenue: 15200,
            average_booking_value: 200,
            rating: 4.6,
            occupancy_rate: 0.78
          },
          {
            venue_id: 3,
            venue_name: '千岛湖钓场',
            location: '杭州千岛湖',
            bookings: 65,
            revenue: 13000,
            average_booking_value: 200,
            rating: 4.7,
            occupancy_rate: 0.72
          },
          {
            venue_id: 4,
            venue_name: '太湖钓场',
            location: '苏州太湖',
            bookings: 58,
            revenue: 11600,
            average_booking_value: 200,
            rating: 4.5,
            occupancy_rate: 0.68
          },
          {
            venue_id: 5,
            venue_name: '洞庭湖钓场',
            location: '岳阳洞庭湖',
            bookings: 42,
            revenue: 8400,
            average_booking_value: 200,
            rating: 4.4,
            occupancy_rate: 0.62
          }
        ]
      } catch (error) {
        console.error('加载场地表现数据失败:', error)
      }
    }

    const renderUserGrowthChart = (data) => {
      const ctx = userGrowthChart.value?.getContext('2d')
      if (!ctx) return

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => item.date),
          datasets: [
            {
              label: '总用户数',
              data: data.map(item => item.total_users),
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: '新增用户',
              data: data.map(item => item.new_users),
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }

    const renderRevenueChart = (data) => {
      const ctx = revenueChart.value?.getContext('2d')
      if (!ctx) return

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.date),
          datasets: [
            {
              label: '收入',
              data: data.map(item => item.revenue),
              backgroundColor: '#2ecc71',
              borderColor: '#27ae60',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '¥' + value.toLocaleString()
                }
              }
            }
          }
        }
      })
    }

    onMounted(async () => {
      await loadDashboardData()
      await loadUserGrowth()
      await loadRevenueAnalysis()
      await loadVenuePerformance()
      
      // 设置最近活动数据
      recentActivities.value = activitiesData
    })

    return {
      dashboardData,
      userGrowthChart,
      revenueChart,
      venuePerformance,
      recentActivities,
      growthGroupBy,
      revenueDays,
      loadUserGrowth,
      loadRevenueAnalysis,
      loadVenuePerformance,
      getActivityIcon,
      formatCurrency,
      formatTime
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
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
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.venues {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.bookings {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  color: #7f8c8d;
}

.stat-change.positive {
  color: #27ae60;
}

.stat-change .active {
  color: #3498db;
}

.stat-change .completion {
  color: #e74c3c;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.chart-controls select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.chart-content {
  height: 300px;
  position: relative;
}

.venue-performance {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.btn-refresh {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-refresh:hover {
  background: #2980b9;
}

.venue-table {
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  align-items: center;
}

.table-header {
  background: #f8f9fa;
  border-radius: 8px;
  font-weight: 600;
  color: #495057;
}

.table-row {
  border-bottom: 1px solid #e9ecef;
}

.table-row:last-child {
  border-bottom: none;
}

.venue-info {
  display: flex;
  flex-direction: column;
}

.venue-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.venue-location {
  font-size: 12px;
  color: #7f8c8d;
}

.rating {
  background: #f39c12;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.occupancy-rate {
  background: #2ecc71;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.recent-activities {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.activity-icon.user {
  background: #3498db;
}

.activity-icon.booking {
  background: #2ecc71;
}

.activity-icon.payment {
  background: #f39c12;
}

.activity-icon.venue {
  background: #e74c3c;
}

.activity-icon.system {
  background: #9b59b6;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #bdc3c7;
}
</style>