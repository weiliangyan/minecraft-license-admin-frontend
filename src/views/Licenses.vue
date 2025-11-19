<template>
  <div class="licenses-container">
    <!-- 页面头部 -->
    <div class="page-header glass-card">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">授权管理</h1>
          <p class="page-subtitle">管理所有授权码，创建、编辑和监控授权状态</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalLicenses || 0 }}</span>
            <span class="stat-label">总授权</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.activeLicenses || 0 }}</span>
            <span class="stat-label">活跃</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和操作区 -->
    <div class="search-section glass-card">
      <div class="search-filters">
        <div class="filter-row">
          <div class="filter-group">
            <el-input
              v-model="searchQuery"
              placeholder="搜索授权码、客户名称或插件"
              prefix-icon="Search"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
              class="search-input"
            />
          </div>

          <div class="filter-group">
            <el-select
              v-model="filterStatus"
              placeholder="状态筛选"
              clearable
              @change="handleSearch"
              class="filter-select"
            >
              <el-option label="全部状态" value="" />
              <el-option label="正常" value="active" />
              <el-option label="已禁用" value="disabled" />
              <el-option label="已过期" value="expired" />
            </el-select>
          </div>

          <div class="filter-group">
            <el-select
              v-model="filterType"
              placeholder="类型筛选"
              clearable
              @change="handleSearch"
              class="filter-select"
            >
              <el-option label="全部类型" value="" />
              <el-option label="永久授权" value="permanent" />
              <el-option label="临时授权" value="temporary" />
              <el-option label="试用授权" value="trial" />
            </el-select>
          </div>

          <div class="filter-group">
            <el-select
              v-model="filterPlugin"
              placeholder="插件筛选"
              clearable
              @change="handleSearch"
              class="filter-select"
            >
              <el-option label="全部插件" value="" />
              <el-option label="DNF增幅系统" value="dnf" />
              <el-option label="宝可梦大逃杀" value="pokemon" />
            </el-select>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button type="success" :icon="Download" @click="handleExport">
            导出Excel
          </el-button>
          <el-button type="warning" :icon="Refresh" @click="handleRefresh">
            刷新
          </el-button>
          <el-button v-if="authStore.isAdmin" type="primary" :icon="Plus" @click="handleCreate">
            创建授权
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section glass-card">
      <div class="table-header">
        <div class="table-title">
          <span class="title-text">授权列表</span>
          <el-tag type="info" size="small">{{ total }} 条记录</el-tag>
        </div>
        <div class="table-actions">
          <el-button-group>
            <el-button :icon="Grid" size="small" @click="setViewMode('grid')" :type="viewMode === 'grid' ? 'primary' : ''">
              网格视图
            </el-button>
            <el-button :icon="List" size="small" @click="setViewMode('table')" :type="viewMode === 'table' ? 'primary' : ''">
              表格视图
            </el-button>
          </el-button-group>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        class="modern-table"
        stripe
        :header-cell-style="{ background: 'transparent' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="license_key" label="授权码" width="260">
          <template #default="{ row }">
            <div class="license-cell">
              <el-tooltip content="点击复制授权码" placement="top">
                <span class="license-key" @click="handleCopy(row.license_key)">
                  {{ row.license_key }}
                </span>
              </el-tooltip>
              <el-button
                type="primary"
                link
                size="small"
                :icon="DocumentCopy"
                @click="handleCopy(row.license_key)"
                class="copy-btn"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="customer_name" label="客户名称" min-width="140">
          <template #default="{ row }">
            <div class="customer-cell">
              <span class="customer-name">{{ row.customer_name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="license_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getLicenseTypeColor(row.license_type)" size="small" effect="light">
              {{ formatLicenseType(row.license_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="plugin_name" label="插件" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.plugin_name" :type="getPluginTypeColor(row.plugin_name)" size="small" effect="plain">
              {{ formatPluginName(row.plugin_name) }}
            </el-tag>
            <el-tag v-else type="info" size="small" effect="plain">
              未指定
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="remaining_days" label="剩余天数" width="120" align="center">
          <template #default="{ row }">
            <div v-if="row.license_type !== 'permanent'" class="days-cell">
              <el-progress
                :percentage="getDaysPercentage(row.remaining_days)"
                :color="getDaysColor(row.remaining_days)"
                :stroke-width="6"
                :show-text="false"
                class="days-progress"
              />
              <span class="days-text" :class="getDaysClass(row.remaining_days)">
                {{ row.remaining_days >= 0 ? `${row.remaining_days}天` : '已过期' }}
              </span>
            </div>
            <el-tag v-else type="success" size="small" effect="light">永久</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="verify_count" label="验证次数" width="100" align="center">
          <template #default="{ row }">
            <span class="verify-count">{{ row.verify_count || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button
                type="primary"
                size="small"
                link
                :icon="View"
                @click="handleViewDetail(row.id)"
                class="action-btn"
              >
                详情
              </el-button>

              <el-button
                v-if="authStore.isAdmin"
                type="warning"
                size="small"
                link
                :icon="Edit"
                @click="handleEdit(row)"
                class="action-btn"
              >
                编辑
              </el-button>

              <el-button
                v-if="authStore.isAdmin"
                :type="row.status === 'active' ? 'danger' : 'success'"
                size="small"
                link
                :icon="row.status === 'active' ? 'Close' : 'Check'"
                @click="handleToggleStatus(row)"
                class="action-btn"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>

              <el-button
                v-if="authStore.isAdmin && row.license_type !== 'permanent'"
                type="success"
                size="small"
                link
                :icon="Timer"
                @click="handleRenew(row)"
                class="action-btn"
              >
                续期
              </el-button>

              <el-dropdown @command="(command) => handleRowAction(command, row)" class="action-dropdown">
                <el-button type="info" size="small" link :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="copy">复制授权码</el-dropdown-item>
                    <el-dropdown-item command="viewLogs">查看日志</el-dropdown-item>
                    <el-dropdown-item command="export" divided>导出单条</el-dropdown-item>
                    <el-dropdown-item command="delete" class="danger-item">删除授权</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作栏 -->
      <div v-if="selectedRows.length > 0" class="batch-actions glass-card">
        <div class="batch-info">
          <span>已选择 {{ selectedRows.length }} 项</span>
        </div>
        <div class="batch-buttons">
          <el-button type="primary" size="small" @click="handleBatchExport">
            批量导出
          </el-button>
          <el-button type="warning" size="small" @click="handleBatchRenew">
            批量续期
          </el-button>
          <el-button type="danger" size="small" @click="handleBatchDisable">
            批量禁用
          </el-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
          background
        />
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="客户名称" prop="customer_name">
          <el-input
            v-model="formData.customer_name"
            placeholder="请输入客户名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="授权类型" prop="license_type">
          <el-select
            v-model="formData.license_type"
            placeholder="请选择授权类型"
            style="width: 100%"
            @change="handleTypeChange"
          >
            <el-option label="永久授权" value="permanent" />
            <el-option label="临时授权" value="temporary" />
            <el-option label="试用授权" value="trial" />
          </el-select>
        </el-form-item>

        <el-form-item label="插件选择" prop="plugin_name">
          <el-select
            v-model="formData.plugin_name"
            placeholder="请选择插件"
            style="width: 100%"
          >
            <el-option label="DNF增幅系统" value="dnf" />
            <el-option label="宝可梦大逃杀" value="pokemon" />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            💡 授权码仅可用于选定的插件
          </div>
        </el-form-item>

        <el-form-item
          v-if="formData.license_type !== 'permanent'"
          label="有效天数"
          prop="expire_days"
        >
          <el-input-number
            v-model="formData.expire_days"
            :min="1"
            :max="3650"
            placeholder="请输入有效天数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="允许的IP" prop="allowed_ips">
          <el-input
            v-model="formData.allowed_ips"
            type="textarea"
            :rows="3"
            placeholder="多个IP用换行分隔，留空则不限制"
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 续期对话框 -->
    <el-dialog
      v-model="renewDialogVisible"
      title="续期授权"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="续期天数">
          <el-input-number
            v-model="renewDays"
            :min="1"
            :max="3650"
            placeholder="请输入续期天数"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="renewLoading" @click="handleRenewSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="授权详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="detailData" :column="2" border>
        <el-descriptions-item label="授权码" :span="2">
          <el-text type="primary" style="font-family: monospace;">
            {{ detailData.license_key }}
          </el-text>
          <el-button
            type="primary"
            size="small"
            icon="CopyDocument"
            link
            @click="handleCopy(detailData.license_key)"
            style="margin-left: 10px"
          >
            复制
          </el-button>
        </el-descriptions-item>

        <el-descriptions-item label="客户名称">
          {{ detailData.customer_name }}
        </el-descriptions-item>

        <el-descriptions-item label="授权类型">
          {{ formatLicenseType(detailData.license_type) }}
        </el-descriptions-item>

        <el-descriptions-item label="所属插件">
          <el-tag v-if="detailData.plugin_name" type="info">
            {{ formatPluginName(detailData.plugin_name) }}
          </el-tag>
          <el-text v-else type="info">未指定</el-text>
        </el-descriptions-item>

        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailData.status)">
            {{ formatStatus(detailData.status) }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="剩余天数">
          <el-tag
            v-if="detailData.license_type !== 'permanent'"
            :type="getRemainingDaysType(detailData.remaining_days)"
          >
            {{ detailData.remaining_days >= 0 ? `${detailData.remaining_days} 天` : '已过期' }}
          </el-tag>
          <el-tag v-else type="success">永久</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="验证次数">
          {{ detailData.verify_count }}
        </el-descriptions-item>

        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDate(detailData.created_at) }}
        </el-descriptions-item>

        <el-descriptions-item label="过期时间" :span="2">
          {{ detailData.expire_at ? formatDate(detailData.expire_at) : '永不过期' }}
        </el-descriptions-item>

        <el-descriptions-item label="最后验证时间" :span="2">
          {{ detailData.last_verify_at ? formatDate(detailData.last_verify_at) : '未验证' }}
        </el-descriptions-item>

        <el-descriptions-item label="最后验证IP" :span="2">
          {{ detailData.last_verify_ip || '无' }}
        </el-descriptions-item>

        <el-descriptions-item label="允许的IP" :span="2">
          <el-text v-if="detailData.allowed_ips">
            {{ detailData.allowed_ips }}
          </el-text>
          <el-text v-else type="info">不限制</el-text>
        </el-descriptions-item>

        <el-descriptions-item label="备注" :span="2">
          <el-text v-if="detailData.notes">{{ detailData.notes }}</el-text>
          <el-text v-else type="info">无</el-text>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 最近验证日志 -->
      <el-divider>最近验证日志</el-divider>

      <el-table
        v-if="detailData && detailData.recent_logs && detailData.recent_logs.length > 0"
        :data="detailData.recent_logs"
        stripe
        border
        max-height="300"
      >
        <el-table-column prop="verify_time" label="验证时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.verify_time) }}
          </template>
        </el-table-column>

        <el-table-column prop="ip" label="IP地址" width="150" />

        <el-table-column prop="success" label="结果" width="80">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'" size="small">
              {{ row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="message" label="详情" min-width="200" />
      </el-table>

      <el-empty
        v-else
        description="暂无验证日志"
        :image-size="100"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import {
  getLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
  renewLicense,
  updateLicenseStatus,
  getLicenseDetail,
  exportLicenses
} from '../api'
import {
  formatDate,
  formatLicenseType,
  formatStatus,
  getStatusType,
  getRemainingDaysType,
  copyToClipboard,
  exportToExcel
} from '../utils'

// 图标导入
import {
  Search,
  Download,
  Refresh,
  Plus,
  View,
  Edit,
  Close,
  Check,
  Timer,
  Delete,
  Grid,
  List,
  DocumentCopy,
  MoreFilled
} from '@element-plus/icons-vue'

// 插件名称格式化
function formatPluginName(pluginName) {
  const pluginMap = {
    'dnf': 'DNF增幅系统',
    'pokemon': '宝可梦大逃杀'
  }
  return pluginMap[pluginName] || pluginName || '未指定'
}

const authStore = useAuthStore()

// 表格数据
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])

// 统计数据
const stats = ref({
  totalLicenses: 0,
  activeLicenses: 0
})

// 视图模式
const viewMode = ref('table')

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const filterPlugin = ref('')

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => formData.id ? '编辑授权' : '创建授权')
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  customer_name: '',
  license_type: '',
  plugin_name: '', // 新增
  expire_days: 30,
  allowed_ips: '',
  notes: ''
})

// 表单验证规则
const formRules = {
  customer_name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  license_type: [
    { required: true, message: '请选择授权类型', trigger: 'change' }
  ],
  plugin_name: [ // 新增
    { required: true, message: '请选择插件', trigger: 'change' }
  ],
  expire_days: [
    { required: true, message: '请输入有效天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: '有效天数范围为1-3650天', trigger: 'blur' }
  ]
}

// 续期对话框
const renewDialogVisible = ref(false)
const renewLoading = ref(false)
const renewDays = ref(30)
const renewingLicense = ref(null)

// 详情对话框
const detailDialogVisible = ref(false)
const detailData = ref(null)

// 获取授权列表
async function fetchLicenses() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value || undefined,
      status: filterStatus.value || undefined,
      license_type: filterType.value || undefined
    }

    const res = await getLicenses(params)
    tableData.value = res.licenses || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取授权列表失败:', error)
    ElMessage.error('获取授权列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
function handleSearch() {
  currentPage.value = 1
  fetchLicenses()
}

// 导出处理
async function handleExport() {
  try {
    ElMessage.info('正在导出数据...')
    const res = await exportLicenses()

    // 处理导出数据
    const exportData = res.map(item => ({
      '授权码': item.license_key,
      '客户名称': item.customer_name,
      '授权类型': formatLicenseType(item.license_type),
      '所属插件': formatPluginName(item.plugin_name), // 新增
      '状态': formatStatus(item.status),
      '剩余天数': item.license_type === 'permanent' ? '永久' : item.remaining_days,
      '验证次数': item.verify_count,
      '创建时间': formatDate(item.created_at),
      '过期时间': item.expire_at ? formatDate(item.expire_at) : '永不过期',
      '最后验证时间': item.last_verify_at ? formatDate(item.last_verify_at) : '未验证',
      '最后验证IP': item.last_verify_ip || '无',
      '允许的IP': item.allowed_ips || '不限制',
      '备注': item.notes || '无'
    }))

    exportToExcel(exportData, `licenses_${new Date().getTime()}.xlsx`)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 创建授权
function handleCreate() {
  resetForm()
  dialogVisible.value = true
}

// 编辑授权
function handleEdit(row) {
  resetForm()
  formData.id = row.id
  formData.customer_name = row.customer_name
  formData.license_type = row.license_type
  formData.plugin_name = row.plugin_name || '' // 新增
  formData.expire_days = row.expire_days || 30
  formData.allowed_ips = row.allowed_ips || ''
  formData.notes = row.notes || ''
  dialogVisible.value = true
}

// 授权类型变化处理
function handleTypeChange(value) {
  if (value === 'permanent') {
    formData.expire_days = 0
  } else if (!formData.expire_days || formData.expire_days === 0) {
    formData.expire_days = 30
  }
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const submitData = {
        customer_name: formData.customer_name,
        license_type: formData.license_type,
        plugin_name: formData.plugin_name, // 新增
        expire_days: formData.license_type === 'permanent' ? undefined : formData.expire_days,
        allowed_ips: formData.allowed_ips || undefined,
        notes: formData.notes || undefined
      }

      console.log('[前端] 准备提交的数据:', submitData)
      console.log('[前端] formData:', JSON.parse(JSON.stringify(formData)))

      if (formData.id) {
        console.log('[前端] 更新授权:', formData.id)
        await updateLicense(formData.id, submitData)
        ElMessage.success('更新成功')
      } else {
        console.log('[前端] 创建授权 - 调用 createLicense')
        await createLicense(submitData)
        console.log('[前端] 创建授权 - 成功返回')
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      fetchLicenses()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 切换状态
async function handleToggleStatus(row) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要${action}该授权吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    await updateLicenseStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchLicenses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    loading.value = false
  }
}

// 续期
function handleRenew(row) {
  renewingLicense.value = row
  renewDays.value = 30
  renewDialogVisible.value = true
}

// 续期提交
async function handleRenewSubmit() {
  if (!renewDays.value || renewDays.value < 1) {
    ElMessage.warning('请输入有效的续期天数')
    return
  }

  renewLoading.value = true
  try {
    await renewLicense(renewingLicense.value.id, renewDays.value)
    ElMessage.success('续期成功')
    renewDialogVisible.value = false
    fetchLicenses()
  } catch (error) {
    console.error('续期失败:', error)
    ElMessage.error('续期失败')
  } finally {
    renewLoading.value = false
  }
}

// 删除授权
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除客户"${row.customer_name}"的授权吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    loading.value = true
    await deleteLicense(row.id)
    ElMessage.success('删除成功')

    // 如果当前页没有数据了，返回上一页
    if (tableData.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }

    fetchLicenses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 查看详情
async function handleViewDetail(id) {
  try {
    loading.value = true
    detailData.value = await getLicenseDetail(id)
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

// 复制授权码
async function handleCopy(text) {
  try {
    await copyToClipboard(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 重置表单
function resetForm() {
  formData.id = null
  formData.customer_name = ''
  formData.license_type = ''
  formData.plugin_name = '' // 新增
  formData.expire_days = 30
  formData.allowed_ips = ''
  formData.notes = ''

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 新增的辅助方法
function getLicenseTypeColor(type) {
  const colorMap = {
    'permanent': 'success',
    'temporary': 'warning',
    'trial': 'info'
  }
  return colorMap[type] || 'info'
}

function getPluginTypeColor(plugin) {
  const colorMap = {
    'dnf': 'primary',
    'pokemon': 'success'
  }
  return colorMap[plugin] || 'info'
}

function getDaysPercentage(days) {
  if (days < 0) return 0
  if (days > 365) return 100
  return Math.min(Math.round((days / 365) * 100), 100)
}

function getDaysColor(days) {
  if (days < 0) return '#f56c6c'
  if (days < 7) return '#e6a23c'
  if (days < 30) return '#409eff'
  return '#67c23a'
}

function getDaysClass(days) {
  if (days < 0) return 'expired'
  if (days < 7) return 'warning'
  if (days < 30) return 'notice'
  return 'normal'
}

function setViewMode(mode) {
  viewMode.value = mode
  ElMessage.info(`已切换到${mode === 'grid' ? '网格' : '表格'}视图`)
}

function handleSelectionChange(selection) {
  selectedRows.value = selection
}

function handleRowAction(command, row) {
  switch (command) {
    case 'copy':
      handleCopy(row.license_key)
      break
    case 'viewLogs':
      router.push(`/logs?license=${row.license_key}`)
      break
    case 'export':
      exportSingleLicense(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

function handleRefresh() {
  fetchLicenses()
  ElMessage.success('数据已刷新')
}

function handleBatchExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的授权')
    return
  }
  // 批量导出逻辑
  ElMessage.info('批量导出功能开发中...')
}

function handleBatchRenew() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要续期的授权')
    return
  }
  // 批量续期逻辑
  ElMessage.info('批量续期功能开发中...')
}

function handleBatchDisable() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要禁用的授权')
    return
  }
  // 批量禁用逻辑
  ElMessage.info('批量禁用功能开发中...')
}

function exportSingleLicense(row) {
  const exportData = [{
    '授权码': row.license_key,
    '客户名称': row.customer_name,
    '授权类型': formatLicenseType(row.license_type),
    '所属插件': formatPluginName(row.plugin_name),
    '状态': formatStatus(row.status),
    '剩余天数': row.license_type === 'permanent' ? '永久' : row.remaining_days,
    '验证次数': row.verify_count,
    '创建时间': formatDate(row.created_at),
    '过期时间': row.expire_at ? formatDate(row.expire_at) : '永不过期'
  }]

  exportToExcel(exportData, `license_${row.license_key}_${new Date().getTime()}.xlsx`)
  ElMessage.success('导出成功')
}

// 初始化
onMounted(() => {
  fetchLicenses()
})
</script>

<style scoped lang="scss">
.licenses-container {
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .page-header {
    padding: 32px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(41, 182, 246, 0.05) 100%);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;

      .header-text {
        flex: 1;

        .page-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-size: 16px;
          color: #666;
          margin: 0;
        }
      }

      .header-stats {
        display: flex;
        gap: 32px;

        .stat-item {
          text-align: center;

          .stat-value {
            display: block;
            font-size: 24px;
            font-weight: 700;
            color: #409eff;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
        }
      }
    }
  }

  .search-section {
    padding: 24px;

    .search-filters {
      .filter-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        flex-wrap: wrap;

        .filter-group {
          flex: 1;
          min-width: 200px;

          .search-input {
            :deep(.el-input__wrapper) {
              border-radius: 24px;
              padding-left: 16px;
            }
          }

          .filter-select {
            width: 100%;
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;

        .el-button {
          border-radius: 24px;
          padding: 10px 20px;
          font-weight: 500;
        }
      }
    }
  }

  .table-section {
    padding: 24px;
    flex: 1;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .table-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-text {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .modern-table {
      .license-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .license-key {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 12px;
          color: #409eff;
          cursor: pointer;
          font-weight: 600;
          background: rgba(64, 158, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.3s;

          &:hover {
            background: rgba(64, 158, 255, 0.2);
          }
        }

        .copy-btn {
          opacity: 0.6;
          transition: opacity 0.3s;

          &:hover {
            opacity: 1;
          }
        }
      }

      .customer-cell {
        .customer-name {
          font-weight: 500;
          color: #333;
        }
      }

      .days-cell {
        .days-progress {
          margin-bottom: 4px;
        }

        .days-text {
          font-size: 12px;
          font-weight: 600;

          &.expired {
            color: #f56c6c;
          }

          &.warning {
            color: #e6a23c;
          }

          &.notice {
            color: #409eff;
          }

          &.normal {
            color: #67c23a;
          }
        }
      }

      .verify-count {
        font-weight: 600;
        color: #666;
      }

      .action-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .action-btn {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 16px;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-1px);
          }
        }

        .action-dropdown {
          .el-button {
            padding: 4px;
            min-height: auto;
          }
        }
      }
    }

    .batch-actions {
      margin: 20px 0;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(41, 182, 246, 0.05) 100%);

      .batch-info {
        font-weight: 500;
        color: #409eff;
      }

      .batch-buttons {
        display: flex;
        gap: 12px;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .licenses-container {
    padding: 10px;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-button) {
    padding: 5px 10px;
  }

  :deep(.el-dialog) {
    width: 95% !important;
  }

  .pagination {
    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}

// 暗黑模式支持
.dark {
  .search-card,
  .table-card {
    background-color: var(--el-bg-color);
  }

  .license-key {
    color: var(--el-color-primary-light-3);
  }
}
</style>
