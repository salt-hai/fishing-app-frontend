<template>
  <div class="venues-container">
    <!-- 搜索和操作栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="钓点ID">
          <el-input v-model="searchForm.venue_id" placeholder="钓点ID" clearable />
        </el-form-item>
        <el-form-item label="钓点名称">
          <el-input v-model="searchForm.venue_name" placeholder="钓点名称" clearable />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="searchForm.city" placeholder="城市" clearable />
        </el-form-item>
        <el-form-item label="水域类型">
          <el-select v-model="searchForm.water_type" placeholder="水域类型" clearable>
            <el-option label="淡水" :value="1" />
            <el-option label="海钓" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="钓点类型">
          <el-select v-model="searchForm.venue_type" placeholder="钓点类型" clearable>
            <el-option label="水库" :value="1" />
            <el-option label="黑坑" :value="2" />
            <el-option label="野河" :value="3" />
            <el-option label="矶钓" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchVenues">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-bar">
        <el-button type="success" @click="exportVenues">
          <el-icon><Download /></el-icon> 导出钓点
        </el-button>
        <el-button type="warning" @click="batchUpdateStatus">
          <el-icon><Edit /></el-icon> 批量修改
        </el-button>
        <el-button type="primary" @click="showAddVenueDialog">
          <el-icon><Plus /></el-icon> 添加钓点
        </el-button>
      </div>
    </el-card>
    
    <!-- 钓点列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="venueList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="venue_id" label="钓点ID" width="120" />
        <el-table-column prop="venue_name" label="钓点名称" width="200">
          <template #default="scope">
            <div class="venue-info">
              <span class="venue-name">{{ scope.row.venue_name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="district" label="区域" width="100" />
        <el-table-column prop="water_type" label="水域类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.water_type === 1" type="primary">淡水</el-tag>
            <el-tag v-else-if="scope.row.water_type === 2" type="success">海钓</el-tag>
            <el-tag v-else>未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="venue_type" label="钓点类型" width="100">
          <template #default="scope">
            {{ getVenueTypeName(scope.row.venue_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="venue_score" label="评分" width="100">
          <template #default="scope">
            <div class="score-display">
              <el-rate v-model="scope.row.venue_score" disabled />
              <span class="score-text">{{ scope.row.venue_score }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="is_free" label="收费" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.is_free" type="success">免费</el-tag>
            <el-tag v-else type="danger">收费</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="online_count" label="在线人数" width="100" />
        <el-table-column prop="fishing_count" label="在钓人数" width="100" />
        <el-table-column prop="favorite_count" label="收藏数" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === 0" type="danger">禁用</el-tag>
            <el-tag v-else type="warning">待审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editVenue(scope.row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewVenueDetail(scope.row)">
              详情
            </el-button>
            <el-dropdown @command="(command) => handleVenueAction(command, scope.row)">
              <el-button type="primary" size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="toggle_status">切换状态</el-dropdown-item>
                  <el-dropdown-item command="manage_chatroom">管理聊天室</el-dropdown-item>
                  <el-dropdown-item command="view_reports">查看举报</el-dropdown-item>
                  <el-dropdown-item command="view_reviews">查看评价</el-dropdown-item>
                  <el-dropdown-item command="edit_location">修改位置</el-dropdown-item>
                  <el-dropdown-item divided command="delete_venue">删除钓点</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 钓点详情对话框 -->
    <el-dialog
      v-model="venueDetailDialog.visible"
      :title="venueDetailDialog.title"
      width="900px"
    >
      <div v-if="venueDetailDialog.venue" class="venue-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="钓点ID">{{ venueDetailDialog.venue.venue_id }}</el-descriptions-item>
          <el-descriptions-item label="钓点名称">{{ venueDetailDialog.venue.venue_name }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{ venueDetailDialog.venue.city }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ venueDetailDialog.venue.district }}</el-descriptions-item>
          <el-descriptions-item label="水域类型">
            <el-tag v-if="venueDetailDialog.venue.water_type === 1" type="primary">淡水</el-tag>
            <el-tag v-else-if="venueDetailDialog.venue.water_type === 2" type="success">海钓</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="钓点类型">{{ getVenueTypeName(venueDetailDialog.venue.venue_type) }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ venueDetailDialog.venue.venue_score }}</el-descriptions-item>
          <el-descriptions-item label="收费">
            <el-tag v-if="venueDetailDialog.venue.is_free" type="success">免费</el-tag>
            <el-tag v-else type="danger">收费 {{ venueDetailDialog.venue.fees }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="面积">{{ venueDetailDialog.venue.area_size }} 平方米</el-descriptions-item>
          <el-descriptions-item label="危险等级">
            <el-tag v-if="venueDetailDialog.venue.danger_level === 1" type="success">安全</el-tag>
            <el-tag v-else-if="venueDetailDialog.venue.danger_level === 2" type="warning">一般</el-tag>
            <el-tag v-else type="danger">危险</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开放时间">{{ venueDetailDialog.venue.open_time }} - {{ venueDetailDialog.venue.close_time }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(venueDetailDialog.venue.created_at) }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <h4>钓点描述</h4>
        <p class="venue-description">{{ venueDetailDialog.venue.description }}</p>
        
        <h4>产出鱼种</h4>
        <p class="fish-species">{{ venueDetailDialog.venue.output_fish_species }}</p>
        
        <el-divider />
        
        <h4>实时统计</h4>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ venueStats.online_count }}</div>
                <div class="stat-label">在线人数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ venueStats.fishing_count }}</div>
                <div class="stat-label">在钓人数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ venueStats.favorite_count }}</div>
                <div class="stat-label">收藏数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ venueStats.report_count }}</div>
                <div class="stat-label">举报数</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <h4>位置信息</h4>
        <div v-if="venueDetailDialog.venue.latitude && venueDetailDialog.venue.longitude" class="map-container">
          <div class="map-placeholder">
            <p>纬度: {{ venueDetailDialog.venue.latitude }}</p>
            <p>经度: {{ venueDetailDialog.venue.longitude }}</p>
            <p>地址: {{ venueDetailDialog.venue.address }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 编辑钓点对话框 -->
    <el-dialog
      v-model="editVenueDialog.visible"
      :title="editVenueDialog.title"
      width="700px"
    >
      <el-form
        ref="editVenueFormRef"
        :model="editVenueDialog.form"
        :rules="editVenueDialog.rules"
        label-width="100px"
      >
        <el-form-item label="钓点名称" prop="venue_name">
          <el-input v-model="editVenueDialog.form.venue_name" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="editVenueDialog.form.city" />
        </el-form-item>
        <el-form-item label="区域" prop="district">
          <el-input v-model="editVenueDialog.form.district" />
        </el-form-item>
        <el-form-item label="水域类型" prop="water_type">
          <el-select v-model="editVenueDialog.form.water_type">
            <el-option label="淡水" :value="1" />
            <el-option label="海钓" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="钓点类型" prop="venue_type">
          <el-select v-model="editVenueDialog.form.venue_type">
            <el-option label="水库" :value="1" />
            <el-option label="黑坑" :value="2" />
            <el-option label="野河" :value="3" />
            <el-option label="矶钓" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="评分" prop="venue_score">
          <el-rate v-model="editVenueDialog.form.venue_score" :max="5" />
        </el-form-item>
        <el-form-item label="收费设置" prop="is_free">
          <el-radio-group v-model="editVenueDialog.form.is_free">
            <el-radio :label="true">免费</el-radio>
            <el-radio :label="false">收费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!editVenueDialog.form.is_free" label="费用" prop="fees">
          <el-input v-model="editVenueDialog.form.fees" placeholder="如：50元/天" />
        </el-form-item>
        <el-form-item label="面积" prop="area_size">
          <el-input-number v-model="editVenueDialog.form.area_size" :min="0" />
        </el-form-item>
        <el-form-item label="危险等级" prop="danger_level">
          <el-select v-model="editVenueDialog.form.danger_level">
            <el-option label="安全" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="危险" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="开放时间" prop="open_time">
          <el-time-picker v-model="editVenueDialog.form.open_time" placeholder="开始时间" />
          <span style="margin: 0 10px">-</span>
          <el-time-picker v-model="editVenueDialog.form.close_time" placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editVenueDialog.form.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editVenueDialog.form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="产出鱼种" prop="output_fish_species">
          <el-input v-model="editVenueDialog.form.output_fish_species" placeholder="如：鲫鱼,鲤鱼,草鱼" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editVenueDialog.form.status">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
            <el-option label="待审核" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVenueDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveVenue">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="batchDialog.visible"
      :title="batchDialog.title"
      width="500px"
    >
      <el-form :model="batchDialog.form" label-width="100px">
        <el-form-item label="操作确认">
          <p>确定要{{ batchDialog.type === 'disable' ? '禁用' : '启用' }}选中的 {{ selectedVenues.length }} 个钓点吗？</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="executeBatchOperation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Download, Edit, Plus, ArrowDown
} from '@element-plus/icons-vue'

export default {
  name: 'VenueList',
  components: {
    Search, Refresh, Download, Edit, Plus, ArrowDown
  },
  setup() {
    const loading = ref(false)
    const venueList = ref([])
    const selectedVenues = ref([])
    
    const searchForm = reactive({
      venue_id: '',
      venue_name: '',
      city: '',
      water_type: '',
      venue_type: ''
    })
    
    const pagination = reactive({
      page: 1,
      page_size: 20,
      total: 0
    })
    
    const venueStats = reactive({
      online_count: 0,
      fishing_count: 0,
      favorite_count: 0,
      report_count: 0
    })
    
    const venueDetailDialog = reactive({
      visible: false,
      title: '钓点详情',
      venue: null
    })
    
    const editVenueDialog = reactive({
      visible: false,
      title: '编辑钓点',
      form: {
        venue_id: '',
        venue_name: '',
        city: '',
        district: '',
        water_type: 1,
        venue_type: 1,
        venue_score: 4.0,
        is_free: true,
        fees: '',
        area_size: 0,
        danger_level: 1,
        open_time: '',
        close_time: '',
        address: '',
        description: '',
        output_fish_species: '',
        status: 1
      },
      rules: {
        venue_name: [
          { required: true, message: '请输入钓点名称', trigger: 'blur' }
        ],
        city: [
          { required: true, message: '请输入城市', trigger: 'blur' }
        ]
      }
    })
    
    const batchDialog = reactive({
      visible: false,
      title: '批量操作',
      type: '',
      form: {}
    })
    
    const loadVenues = async () => {
      loading.value = true
      try {
        // 模拟调用API获取钓点列表
        // const response = await fetch(`/api/venues?page=${pagination.page}&page_size=${pagination.page_size}`)
        // const data = await response.json()
        
        // 使用模拟数据
        const mockVenues = []
        const cities = ['厦门', '福州', '泉州', '漳州', '莆田']
        const venueTypes = [1, 2, 3, 4] // 水库, 黑坑, 野河, 矶钓
        const waterTypes = [1, 2] // 淡水, 海钓
        
        for (let i = 0; i < pagination.page_size; i++) {
          const waterType = waterTypes[Math.floor(Math.random() * waterTypes.length)]
          const venueType = venueTypes[Math.floor(Math.random() * venueTypes.length)]
          const city = cities[Math.floor(Math.random() * cities.length)]
          
          mockVenues.push({
            venue_id: `venue_${(pagination.page - 1) * pagination.page_size + i + 1}`,
            venue_name: `${city}钓场${(pagination.page - 1) * pagination.page_size + i + 1}`,
            city: city,
            district: `${city}区`,
            water_type: waterType,
            venue_type: venueType,
            venue_score: (Math.random() * 2 + 3).toFixed(1),
            is_free: Math.random() > 0.3,
            fees: Math.random() > 0.3 ? `${Math.floor(Math.random() * 200 + 50)}元/天` : '',
            online_count: Math.floor(Math.random() * 100),
            fishing_count: Math.floor(Math.random() * 50),
            favorite_count: Math.floor(Math.random() * 1000),
            status: 1,
            created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            area_size: Math.floor(Math.random() * 20 + 1),
            danger_level: Math.floor(Math.random() * 3) + 1,
            open_time: '06:00',
            close_time: '20:00',
            address: `${city}市${city}区XX路${Math.floor(Math.random() * 100) + 1}号`,
            description: `${city}钓场${(pagination.page - 1) * pagination.page_size + i + 1}的详细描述，是一个${waterType === 1 ? '淡水' : '海钓'}钓点。`,
            output_fish_species: '鲫鱼,鲤鱼,草鱼',
            latitude: 24.0 + Math.random() * 2,
            longitude: 118.0 + Math.random() * 2
          })
        }
        
        venueList.value = mockVenues
        pagination.total = 256
        
      } catch (error) {
        console.error('加载钓点列表失败:', error)
        ElMessage.error('加载钓点列表失败')
      } finally {
        loading.value = false
      }
    }
    
    const searchVenues = () => {
      pagination.page = 1
      loadVenues()
    }
    
    const resetSearch = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
      })
      searchVenues()
    }
    
    const handleSelectionChange = (selection) => {
      selectedVenues.value = selection
    }
    
    const handleSizeChange = (val) => {
      pagination.page_size = val
      loadVenues()
    }
    
    const handleCurrentChange = (val) => {
      pagination.page = val
      loadVenues()
    }
    
    const getVenueTypeName = (type) => {
      const types = { 1: '水库', 2: '黑坑', 3: '野河', 4: '矶钓' }
      return types[type] || '未知'
    }
    
    const formatDateTime = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    }
    
    const viewVenueDetail = async (venue) => {
      venueDetailDialog.venue = venue
      venueDetailDialog.title = `钓点详情 - ${venue.venue_name}`
      
      // 加载钓点统计数据
      try {
        // 模拟调用API获取钓点统计
        venueStats.online_count = venue.online_count
        venueStats.fishing_count = venue.fishing_count
        venueStats.favorite_count = venue.favorite_count
        venueStats.report_count = Math.floor(Math.random() * 10)
      } catch (error) {
        console.error('加载钓点统计失败:', error)
      }
      
      venueDetailDialog.visible = true
    }
    
    const editVenue = (venue) => {
      editVenueDialog.form = { ...venue }
      editVenueDialog.title = `编辑钓点 - ${venue.venue_name}`
      editVenueDialog.visible = true
    }
    
    const saveVenue = async () => {
      try {
        // 模拟调用API更新钓点
        // const response = await fetch(`/api/venues/${editVenueDialog.form.venue_id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(editVenueDialog.form)
        // })
        
        ElMessage.success('钓点信息更新成功')
        editVenueDialog.visible = false
        loadVenues()
      } catch (error) {
        console.error('更新钓点失败:', error)
        ElMessage.error('更新钓点失败')
      }
    }
    
    const handleVenueAction = async (command, venue) => {
      switch (command) {
        case 'toggle_status':
          await toggleVenueStatus(venue)
          break
        case 'manage_chatroom':
          await manageChatroom(venue)
          break
        case 'view_reports':
          await viewReports(venue)
          break
        case 'view_reviews':
          await viewReviews(venue)
          break
        case 'edit_location':
          await editLocation(venue)
          break
        case 'delete_venue':
          await deleteVenue(venue)
          break
      }
    }
    
    const toggleVenueStatus = async (venue) => {
      try {
        await ElMessageBox.confirm(
          `确定要${venue.status === 1 ? '禁用' : '启用'}钓点 "${venue.venue_name}" 吗？`,
          '确认操作',
          { type: 'warning' }
        )
        
        // 模拟调用API
        venue.status = venue.status === 1 ? 0 : 1
        ElMessage.success('操作成功')
        loadVenues()
      } catch {
        // 用户取消操作
      }
    }
    
    const manageChatroom = async (venue) => {
      ElMessage.info('聊天室管理功能开发中')
    }
    
    const viewReports = async (venue) => {
      ElMessage.info('举报查看功能开发中')
    }
    
    const viewReviews = async (venue) => {
      ElMessage.info('评价查看功能开发中')
    }
    
    const editLocation = async (venue) => {
      ElMessage.info('位置修改功能开发中')
    }
    
    const deleteVenue = async (venue) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除钓点 "${venue.venue_name}" 吗？此操作不可恢复！`,
          '确认删除',
          { type: 'error', confirmButtonText: '确定删除' }
        )
        
        // 模拟调用API
        ElMessage.success('钓点删除成功')
        loadVenues()
      } catch {
        // 用户取消操作
      }
    }
    
    const batchUpdateStatus = () => {
      if (selectedVenues.value.length === 0) {
        ElMessage.warning('请先选择要操作的钓点')
        return
      }
      
      batchDialog.type = 'disable'
      batchDialog.title = '批量修改状态'
      batchDialog.visible = true
    }
    
    const executeBatchOperation = async () => {
      try {
        // 模拟批量操作
        ElMessage.success(`成功操作 ${selectedVenues.value.length} 个钓点`)
        batchDialog.visible = false
        selectedVenues.value = []
        loadVenues()
      } catch (error) {
        console.error('批量操作失败:', error)
        ElMessage.error('批量操作失败')
      }
    }
    
    const exportVenues = () => {
      ElMessage.success('钓点数据导出成功')
    }
    
    const showAddVenueDialog = () => {
      editVenueDialog.form = {
        venue_id: '',
        venue_name: '',
        city: '',
        district: '',
        water_type: 1,
        venue_type: 1,
        venue_score: 4.0,
        is_free: true,
        fees: '',
        area_size: 0,
        danger_level: 1,
        open_time: '',
        close_time: '',
        address: '',
        description: '',
        output_fish_species: '',
        status: 1
      }
      editVenueDialog.title = '添加钓点'
      editVenueDialog.visible = true
    }
    
    onMounted(() => {
      loadVenues()
    })
    
    return {
      loading,
      venueList,
      selectedVenues,
      searchForm,
      pagination,
      venueStats,
      venueDetailDialog,
      editVenueDialog,
      batchDialog,
      searchVenues,
      resetSearch,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      getVenueTypeName,
      formatDateTime,
      viewVenueDetail,
      editVenue,
      saveVenue,
      handleVenueAction,
      batchUpdateStatus,
      executeBatchOperation,
      exportVenues,
      showAddVenueDialog
    }
  }
}
</script>

<style scoped>
.venues-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-bar {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.venue-info {
  display: flex;
  align-items: center;
}

.venue-name {
  font-weight: 500;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-text {
  font-weight: 500;
  color: #f56c6c;
}

.venue-detail {
  padding: 20px 0;
}

.venue-description {
  line-height: 1.6;
  color: #666;
  margin-bottom: 10px;
}

.fish-species {
  color: #409EFF;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  color: #666;
  margin-top: 5px;
}

.map-container {
  height: 300px;
  background-color: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder {
  text-align: center;
  color: #666;
}

.map-placeholder p {
  margin: 5px 0;
}
</style>