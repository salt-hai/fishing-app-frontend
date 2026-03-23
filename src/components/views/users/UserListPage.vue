<template>
  <div class="users-container">
    <!-- 搜索和操作栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.user_id" placeholder="用户ID" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone_number" placeholder="手机号" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchForm.nickname" placeholder="昵称" clearable />
        </el-form-item>
        <el-form-item label="用户等级">
          <el-select v-model="searchForm.user_level" placeholder="用户等级" clearable>
            <el-option v-for="level in userLevels" :key="level.value" :label="level.label" :value="level.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.verified_fisherman" placeholder="认证状态" clearable>
            <el-option label="已认证" :value="true" />
            <el-option label="未认证" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUsers">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-bar">
        <el-button type="success" @click="exportUsers">
          <el-icon><Download /></el-icon> 导出用户
        </el-button>
        <el-button type="warning" @click="batchUpdateLevel">
          <el-icon><Edit /></el-icon> 批量修改等级
        </el-button>
        <el-button type="danger" @click="batchDisableUsers">
          <el-icon><Lock /></el-icon> 批量禁用
        </el-button>
        <el-button type="primary" @click="showAddUserDialog">
          <el-icon><Plus /></el-icon> 添加用户
        </el-button>
      </div>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="user_id" label="用户ID" width="120" />
        <el-table-column prop="nickname" label="昵称" width="150">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" :src="scope.row.avatar_url" />
              <span class="nickname">{{ scope.row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone_number" label="手机号" width="130" />
        <el-table-column prop="user_level" label="用户等级" width="100">
          <template #default="scope">
            <el-tag :type="getUserLevelType(scope.row.user_level)">
              {{ getUserLevelName(scope.row.user_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fish_dry_balance" label="小鱼干余额" width="120">
          <template #default="scope">
            <span>{{ scope.row.fish_dry_balance || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="verified_fisherman" label="钓友认证" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.verified_fisherman" type="success">已认证</el-tag>
            <el-tag v-else type="info">未认证</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="last_login_at" label="最后登录" width="180">
          <template #default="scope">
            {{ scope.row.last_login_at ? formatDateTime(scope.row.last_login_at) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === 0" type="danger">禁用</el-tag>
            <el-tag v-else type="warning">待审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editUser(scope.row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewUserDetail(scope.row)">
              详情
            </el-button>
            <el-dropdown @command="(command) => handleUserAction(command, scope.row)">
              <el-button type="primary" size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit_fish_dry">修改小鱼干</el-dropdown-item>
                  <el-dropdown-item command="edit_level">修改等级</el-dropdown-item>
                  <el-dropdown-item command="toggle_verify">切换认证</el-dropdown-item>
                  <el-dropdown-item command="toggle_status">切换状态</el-dropdown-item>
                  <el-dropdown-item command="view_follows">查看关注</el-dropdown-item>
                  <el-dropdown-item divided command="reset_password">重置密码</el-dropdown-item>
                  <el-dropdown-item command="delete_user" type="danger">删除用户</el-dropdown-item>
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
    
    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="userDetailDialog.visible"
      :title="userDetailDialog.title"
      width="800px"
    >
      <div v-if="userDetailDialog.user" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ userDetailDialog.user.user_id }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userDetailDialog.user.phone_number }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ userDetailDialog.user.nickname }}</el-descriptions-item>
          <el-descriptions-item label="用户等级">
            <el-tag :type="getUserLevelType(userDetailDialog.user.user_level)">
              {{ getUserLevelName(userDetailDialog.user.user_level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="小鱼干余额">{{ userDetailDialog.user.fish_dry_balance || 0 }}</el-descriptions-item>
          <el-descriptions-item label="钓友认证">
            <el-tag v-if="userDetailDialog.user.verified_fisherman" type="success">已认证</el-tag>
            <el-tag v-else type="info">未认证</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="性别">{{ userDetailDialog.user.gender === 1 ? '女' : '男' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDateTime(userDetailDialog.user.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ userDetailDialog.user.last_login_at ? formatDateTime(userDetailDialog.user.last_login_at) : '从未登录' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="userDetailDialog.user.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="userDetailDialog.user.status === 0" type="danger">禁用</el-tag>
            <el-tag v-else type="warning">待审核</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <h4>关注统计</h4>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ userStats.followers || 0 }}</div>
                <div class="stat-label">粉丝数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ userStats.following || 0 }}</div>
                <div class="stat-label">关注数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ userStats.mutual || 0 }}</div>
                <div class="stat-label">互关数</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    
    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editUserDialog.visible"
      :title="editUserDialog.title"
      width="600px"
    >
      <el-form
        ref="editUserFormRef"
        :model="editUserDialog.form"
        :rules="editUserDialog.rules"
        label-width="100px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editUserDialog.form.nickname" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone_number">
          <el-input v-model="editUserDialog.form.phone_number" disabled />
        </el-form-item>
        <el-form-item label="用户等级" prop="user_level">
          <el-select v-model="editUserDialog.form.user_level">
            <el-option v-for="level in userLevels" :key="level.value" :label="level.label" :value="level.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="小鱼干余额" prop="fish_dry_balance">
          <el-input-number v-model="editUserDialog.form.fish_dry_balance" :min="0" />
        </el-form-item>
        <el-form-item label="钓友认证" prop="verified_fisherman">
          <el-switch v-model="editUserDialog.form.verified_fisherman" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editUserDialog.form.status">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
            <el-option label="待审核" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editUserDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="batchDialog.visible"
      :title="batchDialog.title"
      width="500px"
    >
      <el-form :model="batchDialog.form" label-width="100px">
        <el-form-item :label="batchDialog.type === 'level' ? '用户等级' : '操作确认'">
          <el-select v-if="batchDialog.type === 'level'" v-model="batchDialog.form.user_level">
            <el-option v-for="level in userLevels" :key="level.value" :label="level.label" :value="level.value" />
          </el-select>
          <div v-else>
            <p>确定要{{ batchDialog.type === 'disable' ? '禁用' : '删除' }}选中的 {{ selectedUsers.length }} 个用户吗？</p>
          </div>
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
  Search, Refresh, Download, Edit, Lock, Plus, ArrowDown
} from '@element-plus/icons-vue'

export default {
  name: 'UserList',
  components: {
    Search, Refresh, Download, Edit, Lock, Plus, ArrowDown
  },
  setup() {
    const loading = ref(false)
    const userList = ref([])
    const selectedUsers = ref([])
    
    const searchForm = reactive({
      user_id: '',
      phone_number: '',
      nickname: '',
      user_level: '',
      verified_fisherman: ''
    })
    
    const pagination = reactive({
      page: 1,
      page_size: 20,
      total: 0
    })
    
    const userStats = reactive({
      followers: 0,
      following: 0,
      mutual: 0
    })
    
    const userDetailDialog = reactive({
      visible: false,
      title: '用户详情',
      user: null
    })
    
    const editUserDialog = reactive({
      visible: false,
      title: '编辑用户',
      form: {
        user_id: '',
        nickname: '',
        phone_number: '',
        user_level: 1,
        fish_dry_balance: 0,
        verified_fisherman: false,
        status: 1
      },
      rules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 64, message: '昵称长度在 2 到 64 个字符', trigger: 'blur' }
        ]
      }
    })
    
    const batchDialog = reactive({
      visible: false,
      title: '批量操作',
      type: '',
      form: {
        user_level: 1
      }
    })
    
    const userLevels = [
      { value: 1, label: '小白' },
      { value: 2, label: '新手' },
      { value: 3, label: '老炮' },
      { value: 4, label: '大师' },
      { value: 5, label: '传奇' }
    ]
    
    const loadUsers = async () => {
      loading.value = true
      try {
        // 模拟调用API获取用户列表
        // const response = await fetch(`/api/users/list?page=${pagination.page}&page_size=${pagination.page_size}`)
        // const data = await response.json()
        
        // 使用模拟数据
        const mockUsers = []
        for (let i = 0; i < pagination.page_size; i++) {
          mockUsers.push({
            user_id: `user_${(pagination.page - 1) * pagination.page_size + i + 1}`,
            nickname: `钓友${(pagination.page - 1) * pagination.page_size + i + 1}`,
            phone_number: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            user_level: Math.floor(Math.random() * 5) + 1,
            fish_dry_balance: Math.floor(Math.random() * 10000),
            verified_fisherman: Math.random() > 0.5,
            status: 1,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            last_login_at: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
            avatar_url: 'https://via.placeholder.com/40'
          })
        }
        
        userList.value = mockUsers
        pagination.total = 1234
        
      } catch (error) {
        console.error('加载用户列表失败:', error)
        ElMessage.error('加载用户列表失败')
      } finally {
        loading.value = false
      }
    }
    
    const searchUsers = () => {
      pagination.page = 1
      loadUsers()
    }
    
    const resetSearch = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
      })
      searchUsers()
    }
    
    const handleSelectionChange = (selection) => {
      selectedUsers.value = selection
    }
    
    const handleSizeChange = (val) => {
      pagination.page_size = val
      loadUsers()
    }
    
    const handleCurrentChange = (val) => {
      pagination.page = val
      loadUsers()
    }
    
    const getUserLevelName = (level) => {
      const levelObj = userLevels.find(l => l.value === level)
      return levelObj ? levelObj.label : '未知'
    }
    
    const getUserLevelType = (level) => {
      const types = { 1: 'info', 2: '', 3: 'warning', 4: 'success', 5: 'danger' }
      return types[level] || 'info'
    }
    
    const formatDateTime = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    }
    
    const viewUserDetail = async (user) => {
      userDetailDialog.user = user
      userDetailDialog.title = `用户详情 - ${user.nickname}`
      
      // 加载用户统计数据
      try {
        // 模拟调用API获取用户统计
        // const response = await fetch(`/api/users/${user.user_id}/stats`)
        // const data = await response.json()
        
        userStats.followers = Math.floor(Math.random() * 1000)
        userStats.following = Math.floor(Math.random() * 500)
        userStats.mutual = Math.floor(Math.random() * 100)
      } catch (error) {
        console.error('加载用户统计失败:', error)
      }
      
      userDetailDialog.visible = true
    }
    
    const editUser = (user) => {
      editUserDialog.form = { ...user }
      editUserDialog.title = `编辑用户 - ${user.nickname}`
      editUserDialog.visible = true
    }
    
    const saveUser = async () => {
      try {
        // 模拟调用API更新用户
        // const response = await fetch(`/api/users/${editUserDialog.form.user_id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(editUserDialog.form)
        // })
        
        ElMessage.success('用户信息更新成功')
        editUserDialog.visible = false
        loadUsers()
      } catch (error) {
        console.error('更新用户失败:', error)
        ElMessage.error('更新用户失败')
      }
    }
    
    const handleUserAction = async (command, user) => {
      switch (command) {
        case 'edit_fish_dry':
          editUserDialog.form = { ...user }
          editUserDialog.title = `修改小鱼干 - ${user.nickname}`
          editUserDialog.visible = true
          break
        case 'edit_level':
          editUserDialog.form = { ...user }
          editUserDialog.title = `修改等级 - ${user.nickname}`
          editUserDialog.visible = true
          break
        case 'toggle_verify':
          await toggleUserVerify(user)
          break
        case 'toggle_status':
          await toggleUserStatus(user)
          break
        case 'view_follows':
          viewUserDetail(user)
          break
        case 'reset_password':
          await resetUserPassword(user)
          break
        case 'delete_user':
          await deleteUser(user)
          break
      }
    }
    
    const toggleUserVerify = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要${user.verified_fisherman ? '取消认证' : '通过认证'}用户 "${user.nickname}" 吗？`,
          '确认操作',
          { type: 'warning' }
        )
        
        // 模拟调用API
        user.verified_fisherman = !user.verified_fisherman
        ElMessage.success('操作成功')
        loadUsers()
      } catch {
        // 用户取消操作
      }
    }
    
    const toggleUserStatus = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要${user.status === 1 ? '禁用' : '启用'}用户 "${user.nickname}" 吗？`,
          '确认操作',
          { type: 'warning' }
        )
        
        // 模拟调用API
        user.status = user.status === 1 ? 0 : 1
        ElMessage.success('操作成功')
        loadUsers()
      } catch {
        // 用户取消操作
      }
    }
    
    const resetUserPassword = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要重置用户 "${user.nickname}" 的密码吗？`,
          '确认操作',
          { type: 'warning' }
        )
        
        ElMessage.success('密码重置成功，新密码已发送到用户手机')
      } catch {
        // 用户取消操作
      }
    }
    
    const deleteUser = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除用户 "${user.nickname}" 吗？此操作不可恢复！`,
          '确认删除',
          { type: 'error', confirmButtonText: '确定删除' }
        )
        
        // 模拟调用API
        ElMessage.success('用户删除成功')
        loadUsers()
      } catch {
        // 用户取消操作
      }
    }
    
    const batchUpdateLevel = () => {
      if (selectedUsers.value.length === 0) {
        ElMessage.warning('请先选择要操作的用户')
        return
      }
      
      batchDialog.type = 'level'
      batchDialog.title = '批量修改等级'
      batchDialog.visible = true
    }
    
    const batchDisableUsers = () => {
      if (selectedUsers.value.length === 0) {
        ElMessage.warning('请先选择要操作的用户')
        return
      }
      
      batchDialog.type = 'disable'
      batchDialog.title = '批量禁用用户'
      batchDialog.visible = true
    }
    
    const executeBatchOperation = async () => {
      try {
        if (batchDialog.type === 'level') {
          // 模拟批量修改等级
          ElMessage.success(`成功修改 ${selectedUsers.value.length} 个用户的等级`)
        } else if (batchDialog.type === 'disable') {
          // 模拟批量禁用
          ElMessage.success(`成功禁用 ${selectedUsers.value.length} 个用户`)
        }
        
        batchDialog.visible = false
        selectedUsers.value = []
        loadUsers()
      } catch (error) {
        console.error('批量操作失败:', error)
        ElMessage.error('批量操作失败')
      }
    }
    
    const exportUsers = () => {
      ElMessage.success('用户数据导出成功')
    }
    
    const showAddUserDialog = () => {
      editUserDialog.form = {
        user_id: '',
        nickname: '',
        phone_number: '',
        user_level: 1,
        fish_dry_balance: 0,
        verified_fisherman: false,
        status: 1
      }
      editUserDialog.title = '添加用户'
      editUserDialog.visible = true
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    return {
      loading,
      userList,
      selectedUsers,
      searchForm,
      pagination,
      userStats,
      userDetailDialog,
      editUserDialog,
      batchDialog,
      userLevels,
      searchUsers,
      resetSearch,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      getUserLevelName,
      getUserLevelType,
      formatDateTime,
      viewUserDetail,
      editUser,
      saveUser,
      handleUserAction,
      batchUpdateLevel,
      batchDisableUsers,
      executeBatchOperation,
      exportUsers,
      showAddUserDialog
    }
  }
}
</script>

<style scoped>
.users-container {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nickname {
  font-weight: 500;
}

.user-detail {
  padding: 20px 0;
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
</style>