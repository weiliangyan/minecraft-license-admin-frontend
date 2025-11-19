<template>
  <div class="customer-dashboard-container">
    <!-- 顶部导航栏 -->
    <div class="navbar glass-card">
      <div class="navbar-content">
        <div class="navbar-brand">
          <div class="brand-icon">
            <el-icon :size="32" color="#409eff"><Key /></el-icon>
          </div>
          <div class="brand-text">
            <h1 class="brand-name">客户门户</h1>
            <span class="brand-subtitle">License Portal</span>
          </div>
        </div>

        <div class="navbar-actions">
          <div class="user-profile">
            <div class="user-avatar">
              <el-avatar :size="40" :style="{ background: 'linear-gradient(135deg, #409eff 0%, #29b6f6 100%)' }">
                {{ getUserInitials() }}
              </el-avatar>
            </div>
            <div class="user-details">
              <span class="username">{{ customerInfo?.customer_name }}</span>
              <span class="role">客户用户</span>
            </div>
          </div>
          <el-button
            type="danger"
            plain
            size="small"
            class="logout-btn"
            @click="handleLogout"
          >
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner glass-card">
        <div class="welcome-content">
          <div class="welcome-info">
            <h2 class="welcome-title">欢迎回来，{{ customerInfo?.customer_name }}！</h2>
            <p class="welcome-subtitle">这是您的授权管理控制台，您可以查看授权状态和管理IP绑定</p>
          </div>
          <div class="welcome-actions">
            <el-button type="primary" :icon="Refresh" @click="loadLicenseInfo" :loading="loading">
              刷新数据
            </el-button>
          </div>
        </div>
      </div>

      <!-- 授权信息卡片 -->
      <div class="license-section">
        <div class="glass-card license-card" v-loading="loading">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon">
                <el-icon :size="24" color="#409eff"><Box /></el-icon>
              </div>
              <div class="header-text">
                <h3 class="card-title">我的授权信息</h3>
                <p class="card-subtitle">查看和管理您的授权详情</p>
              </div>
            </div>
            <div class="header-actions">
              <el-button type="primary" link :icon="Refresh" @click="loadLicenseInfo" :loading="loading">
                刷新
              </el-button>
            </div>
          </div>

          <div v-if="licenseInfo" class="license-info-grid">
            <!-- 授权码 -->
            <div class="info-card highlight">
              <div class="info-icon">
                <el-icon :size="20" color="#409eff"><Key /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">授权码</div>
                <div class="license-display">
                  <span class="license-key">{{ licenseInfo.license_key }}</span>
                  <el-button
                    @click="copyLicenseKey"
                    type="primary"
                    link
                    size="small"
                    class="copy-action"
                  >
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 客户名称 -->
            <div class="info-card">
              <div class="info-icon">
                <el-icon :size="20" color="#67c23a"><User /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">客户名称</div>
                <div class="info-value">{{ licenseInfo.customer_name }}</div>
              </div>
            </div>

            <!-- 授权类型 -->
            <div class="info-card">
              <div class="info-icon">
                <el-icon :size="20" color="#e6a23c"><Tickets /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">授权类型</div>
                <el-tag :type="getLicenseTypeTag(licenseInfo.license_type)" size="small" effect="light">
                  {{ getLicenseTypeName(licenseInfo.license_type) }}
                </el-tag>
              </div>
            </div>

            <!-- 状态 -->
            <div class="info-card">
              <div class="info-icon">
                <el-icon :size="20" :color="getStatusIconColor(licenseInfo.status)"><CircleCheck /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">当前状态</div>
                <el-tag :type="getStatusTag(licenseInfo.status)" size="small" effect="dark">
                  {{ getStatusName(licenseInfo.status) }}
                </el-tag>
              </div>
            </div>

            <!-- 剩余天数 -->
            <div class="info-card" v-if="licenseInfo.remaining_days !== null">
              <div class="info-icon">
                <el-icon :size="20" :color="getDaysIconColor(licenseInfo.remaining_days)"><Clock /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">剩余天数</div>
                <div class="days-display">
                  <el-progress
                    :percentage="getDaysPercentage(licenseInfo.remaining_days)"
                    :color="getDaysColor(licenseInfo.remaining_days)"
                    :stroke-width="8"
                    :show-text="false"
                    class="days-progress"
                  />
                  <span class="days-text" :class="getDaysClass(licenseInfo.remaining_days)">
                    {{ licenseInfo.remaining_days >= 0 ? `${licenseInfo.remaining_days} 天` : '已过期' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 绑定IP -->
            <div class="info-card">
              <div class="info-icon">
                <el-icon :size="20" color="#909399"><Monitor /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">绑定IP</div>
                <div class="ip-display">
                  <span v-if="licenseInfo.bound_ip" class="bound-ip">{{ licenseInfo.bound_ip }}</span>
                  <el-text v-else type="info">未绑定</el-text>
                </div>
              </div>
            </div>

            <!-- 验证次数 -->
            <div class="info-card">
              <div class="info-icon">
                <el-icon :size="20" color="#409eff"><TrendCharts /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">验证次数</div>
                <div class="info-value">{{ licenseInfo.verify_count }} 次</div>
              </div>
            </div>

            <!-- 创建时间 -->
            <div class="info-card">
              <div class="info-icon">
                <el-icon :size="20" color="#606266"><Calendar /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">创建时间</div>
                <div class="info-value">{{ formatDate(licenseInfo.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作区域 -->
      <div class="actions-grid">
        <!-- IP解绑操作 -->
        <div class="glass-card action-card">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon warning">
                <el-icon :size="24" color="#e6a23c"><Warning /></el-icon>
              </div>
              <div class="header-text">
                <h3 class="card-title">IP管理</h3>
                <p class="card-subtitle">更换服务器时需要解绑IP</p>
              </div>
            </div>
          </div>

          <div class="action-content">
            <div class="ip-status">
              <div v-if="licenseInfo?.bound_ip" class="current-ip">
                <div class="status-icon bound">
                  <el-icon><Monitor /></el-icon>
                </div>
                <div class="status-info">
                  <span class="status-label">当前绑定IP</span>
                  <span class="status-value">{{ licenseInfo.bound_ip }}</span>
                </div>
              </div>
              <div v-else class="no-ip">
                <div class="status-icon unbound">
                  <el-icon><Close /></el-icon>
                </div>
                <div class="status-info">
                  <span class="status-label">未绑定IP</span>
                  <span class="status-value">首次激活将自动绑定</span>
                </div>
              </div>
            </div>

            <el-button
              @click="handleUnbindIP"
              type="danger"
              size="large"
              :disabled="!licenseInfo?.bound_ip"
              :loading="unbinding"
              class="action-btn danger"
            >
              <el-icon><Close /></el-icon>
              解绑IP
            </el-button>

            <el-alert
              v-if="licenseInfo?.bound_ip"
              title="重要提醒"
              type="warning"
              :closable="false"
              show-icon
              class="action-alert"
            >
              <p>解绑IP后，当前服务器将无法使用此授权码，需要在新服务器上重新激活。</p>
            </el-alert>
          </div>
        </div>

        <!-- 快捷帮助 -->
        <div class="glass-card action-card">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon info">
                <el-icon :size="24" color="#409eff"><QuestionFilled /></el-icon>
              </div>
              <div class="header-text">
                <h3 class="card-title">使用帮助</h3>
                <p class="card-subtitle">常见问题解答</p>
              </div>
            </div>
          </div>

          <div class="help-content">
            <div class="help-items">
              <div class="help-item">
                <div class="help-icon">
                  <el-icon><InfoFilled /></el-icon>
                </div>
                <div class="help-text">
                  <span class="help-title">什么是IP绑定？</span>
                  <span class="help-desc">为保护授权安全，系统会在首次验证时绑定服务器IP</span>
                </div>
              </div>
              <div class="help-item">
                <div class="help-icon">
                  <el-icon><RefreshRight /></el-icon>
                </div>
                <div class="help-text">
                  <span class="help-title">如何更换服务器？</span>
                  <span class="help-desc">先解绑IP，然后在新服务器上重新激活授权码</span>
                </div>
              </div>
              <div class="help-item">
                <div class="help-icon">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="help-text">
                  <span class="help-title">需要技术支持？</span>
                  <span class="help-desc">请联系您的授权管理员获取帮助</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 验证日志 -->
      <div class="logs-section glass-card">
        <div class="card-header">
          <div class="header-left">
            <div class="header-icon">
              <el-icon :size="24" color="#409eff"><Document /></el-icon>
            </div>
            <div class="header-text">
              <h3 class="card-title">最近验证记录</h3>
              <p class="card-subtitle">查看授权码的验证历史</p>
            </div>
          </div>
          <div class="header-actions">
            <el-button type="primary" link :icon="Refresh" @click="loadLogs" :loading="logsLoading">
              刷新
            </el-button>
          </div>
        </div>

        <div class="logs-content">
          <el-table
            :data="logs"
            v-loading="logsLoading"
            class="modern-table"
            stripe
            :header-cell-style="{ background: 'transparent' }"
          >
            <el-table-column prop="server_ip" label="服务器IP" width="150">
              <template #default="{ row }">
                <span class="ip-address">{{ row.server_ip }}</span>
              </template>
            </el-table-column>
            <el-table-column label="验证结果" width="120">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'" size="small" effect="light">
                  <el-icon><CircleCheck v-if="row.success" /><CircleClose v-else /></el-icon>
                  {{ row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="详情" min-width="200" />
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="{ row }">
                <span class="timestamp">{{ formatDate(row.created_at) }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="logsTotal > logsPageSize" class="logs-pagination">
            <el-pagination
              v-model:current-page="logsPage"
              v-model:page-size="logsPageSize"
              :total="logsTotal"
              layout="total, prev, pager, next"
              background
              @current-change="loadLogs"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Key,
  SwitchButton,
  Refresh,
  CopyDocument,
  Close,
  Box,
  User,
  Tickets,
  CircleCheck,
  Clock,
  Monitor,
  TrendCharts,
  Calendar,
  Warning,
  QuestionFilled,
  InfoFilled,
  RefreshRight,
  Phone,
  Document,
  CircleClose
} from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const unbinding = ref(false)
const logsLoading = ref(false)

const customerInfo = ref(null)
const licenseInfo = ref(null)
const logs = ref([])
const logsPage = ref(1)
const logsPageSize = ref(20)
const logsTotal = ref(0)

// 获取axios实例
const getAxios = () => {
  const token = localStorage.getItem('customer_token')
  return axios.create({
    baseURL: '/api/customer',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

// 加载授权信息
const loadLicenseInfo = async () => {
  loading.value = true
  try {
    const api = getAxios()
    const response = await api.get('/info')
    licenseInfo.value = response.data
  } catch (error) {
    ElMessage.error('加载授权信息失败')
    if (error.response?.status === 401) {
      handleLogout()
    }
  } finally {
    loading.value = false
  }
}

// 加载验证日志
const loadLogs = async () => {
  logsLoading.value = true
  try {
    const api = getAxios()
    const response = await api.get('/logs', {
      params: {
        page: logsPage.value,
        limit: logsPageSize.value
      }
    })
    logs.value = response.data.logs
    logsTotal.value = response.data.total
  } catch (error) {
    ElMessage.error('加载验证日志失败')
  } finally {
    logsLoading.value = false
  }
}

// 复制授权码
const copyLicenseKey = async () => {
  try {
    await navigator.clipboard.writeText(licenseInfo.value.license_key)
    ElMessage.success('授权码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 解绑IP
const handleUnbindIP = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要解绑IP ${licenseInfo.value.bound_ip} 吗？解绑后当前服务器将无法使用此授权码。`,
      '确认解绑',
      {
        confirmButtonText: '确定解绑',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    unbinding.value = true
    try {
      const api = getAxios()
      const response = await api.post('/unbind-ip')

      if (response.data.success) {
        ElMessage.success(response.data.message)
        await loadLicenseInfo()
        await loadLogs()
      } else {
        ElMessage.warning(response.data.message)
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '解绑失败')
    } finally {
      unbinding.value = false
    }
  } catch {
    // 用户取消
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('customer_token')
  localStorage.removeItem('customer_info')
  router.push('/customer/login')
}

// 获取授权类型标签
const getLicenseTypeTag = (type) => {
  const map = {
    permanent: 'success',
    temporary: 'warning',
    trial: 'info'
  }
  return map[type] || 'info'
}

// 获取授权类型名称
const getLicenseTypeName = (type) => {
  const map = {
    permanent: '永久授权',
    temporary: '临时授权',
    trial: '试用授权'
  }
  return map[type] || type
}

// 获取状态标签
const getStatusTag = (status) => {
  const map = {
    active: 'success',
    disabled: 'danger',
    expired: 'warning'
  }
  return map[status] || 'info'
}

// 获取状态名称
const getStatusName = (status) => {
  const map = {
    active: '正常',
    disabled: '已禁用',
    expired: '已过期'
  }
  return map[status] || status
}

// 新增的辅助方法
const getUserInitials = () => {
  const name = customerInfo.value?.customer_name || '客户'
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusIconColor = (status) => {
  const colorMap = {
    active: '#67c23a',
    disabled: '#f56c6c',
    expired: '#e6a23c'
  }
  return colorMap[status] || '#909399'
}

const getDaysIconColor = (days) => {
  if (days < 0) return '#f56c6c'
  if (days < 7) return '#e6a23c'
  if (days < 30) return '#409eff'
  return '#67c23a'
}

const getDaysPercentage = (days) => {
  if (days < 0) return 0
  if (days > 365) return 100
  return Math.min(Math.round((days / 365) * 100), 100)
}

const getDaysColor = (days) => {
  if (days < 0) return '#f56c6c'
  if (days < 7) return '#e6a23c'
  if (days < 30) return '#409eff'
  return '#67c23a'
}

const getDaysClass = (days) => {
  if (days < 0) return 'expired'
  if (days < 7) return 'warning'
  if (days < 30) return 'notice'
  return 'normal'
}

onMounted(() => {
  // 检查是否已登录
  const token = localStorage.getItem('customer_token')
  if (!token) {
    router.push('/customer/login')
    return
  }

  // 加载客户信息
  const info = localStorage.getItem('customer_info')
  if (info) {
    customerInfo.value = JSON.parse(info)
  }

  // 加载数据
  loadLicenseInfo()
  loadLogs()
})
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.customer-dashboard-container {
  min-height: 100vh;
  background: $bg-primary;
  display: flex;
  flex-direction: column;
}

// 顶部导航栏
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(245, 249, 255, 0.8);
  padding: 0 30px;
  margin: 0;
  border-radius: 0;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.08);

  .navbar-content {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 16px;

    .brand-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
    }

    .brand-text {
      .brand-name {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 2px 0;
        color: #333;
      }

      .brand-subtitle {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 20px;

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-details {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;

        .username {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          line-height: 1.2;
        }

        .role {
          font-size: 12px;
          color: #999;
          line-height: 1.2;
        }
      }
    }

    .logout-btn {
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 500;
    }
  }
}

// 主要内容
.main-content {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

// 欢迎横幅
.welcome-banner {
  padding: 32px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(41, 182, 246, 0.05) 100%);

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    .welcome-info {
      flex: 1;

      .welcome-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
        background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .welcome-subtitle {
        font-size: 16px;
        color: #666;
        margin: 0;
      }
    }
  }
}

// 授权信息区域
.license-section {
  .license-card {
    padding: 32px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .header-icon {
          width: 48px;
          height: 48px;
          background: rgba(64, 158, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.warning {
            background: rgba(230, 162, 60, 0.1);
          }

          &.info {
            background: rgba(64, 158, 255, 0.1);
          }
        }

        .header-text {
          .card-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 4px 0;
            color: #333;
          }

          .card-subtitle {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
        }
      }
    }

    .license-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;

      .info-card {
        padding: 20px;
        background: rgba(245, 249, 255, 0.8);
        border-radius: 16px;
        border: 1px solid rgba(245, 249, 255, 0.8);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 16px;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(25, 118, 210, 0.1);
        }

        &.highlight {
          background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(41, 182, 246, 0.05) 100%);
          border-color: rgba(64, 158, 255, 0.2);
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
          min-width: 0;

          .info-label {
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

          .license-display {
            display: flex;
            align-items: center;
            gap: 8px;

            .license-key {
              font-family: 'Consolas', 'Monaco', monospace;
              font-size: 14px;
              font-weight: 600;
              color: #409eff;
              background: rgba(64, 158, 255, 0.1);
              padding: 4px 8px;
              border-radius: 6px;
              word-break: break-all;
            }

            .copy-action {
              opacity: 0.6;
              transition: opacity 0.3s;

              &:hover {
                opacity: 1;
              }
            }
          }

          .days-display {
            .days-progress {
              margin-bottom: 6px;
            }

            .days-text {
              font-size: 14px;
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

          .ip-display {
            .bound-ip {
              font-family: 'Consolas', 'Monaco', monospace;
              font-weight: 600;
              color: #409eff;
              background: rgba(64, 158, 255, 0.1);
              padding: 4px 8px;
              border-radius: 6px;
            }
          }
        }
      }
    }
  }
}

// 操作区域
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  .action-card {
    padding: 24px;

    .card-header {
      margin-bottom: 20px;
    }

    .action-content {
      .ip-status {
        margin-bottom: 20px;

        .current-ip,
        .no-ip {
          padding: 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;

          .status-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;

            &.bound {
              background: rgba(103, 194, 58, 0.1);
              color: #67c23a;
            }

            &.unbound {
              background: rgba(144, 147, 153, 0.1);
              color: #909399;
            }
          }

          .status-info {
            flex: 1;

            .status-label {
              display: block;
              font-size: 12px;
              color: #999;
              margin-bottom: 4px;
            }

            .status-value {
              font-size: 14px;
              font-weight: 600;
              color: #333;
            }
          }
        }
      }

      .action-btn {
        width: 100%;
        height: 48px;
        border-radius: 24px;
        font-weight: 600;
        font-size: 16px;

        &.danger {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          border: none;
          box-shadow: 0 4px 16px rgba(245, 108, 108, 0.3);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 108, 108, 0.4);
          }
        }
      }

      .action-alert {
        margin-top: 16px;
      }

      .help-content {
        .help-items {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .help-item {
            display: flex;
            gap: 12px;
            padding: 16px;
            background: rgba(245, 249, 255, 0.8);
            border-radius: 12px;
            transition: all 0.3s;

            &:hover {
              background: rgba(255, 255, 255, 0.95);
              transform: translateX(4px);
            }

            .help-icon {
              width: 32px;
              height: 32px;
              background: rgba(64, 158, 255, 0.1);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #409eff;
              flex-shrink: 0;
            }

            .help-text {
              flex: 1;

              .help-title {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
              }

              .help-desc {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
              }
            }
          }
        }
      }
    }
  }
}

// 日志区域
.logs-section {
  padding: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-icon {
        width: 48px;
        height: 48px;
        background: rgba(64, 158, 255, 0.1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header-text {
        .card-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #333;
        }

        .card-subtitle {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
      }
    }
  }

  .logs-content {
    .modern-table {
      .ip-address {
        font-family: 'Consolas', 'Monaco', monospace;
        font-weight: 500;
        color: #409eff;
      }

      .timestamp {
        font-size: 12px;
        color: #666;
      }
    }

    .logs-pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main-content {
    padding: 20px;
  }

  .license-section .license-card .license-info-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 15px;

    .navbar-brand {
      .brand-name {
        font-size: 18px;
      }

      .brand-subtitle {
        font-size: 10px;
      }
    }

    .navbar-actions {
      .user-profile {
        .user-details {
          display: none;
        }
      }
    }
  }

  .main-content {
    padding: 15px;
    gap: 16px;
  }

  .welcome-banner {
    padding: 20px;

    .welcome-content {
      flex-direction: column;
      text-align: center;
    }
  }

  .license-section .license-card {
    padding: 20px;

    .license-info-grid {
      grid-template-columns: 1fr;
    }
  }

  .actions-grid .action-card {
    padding: 20px;
  }

  .logs-section {
    padding: 20px;
  }
}

// 深色模式支持
html.dark {
  .customer-dashboard-container {
    background: $bg-secondary;
  }

  .navbar {
    background: rgba(45, 45, 45, 0.9);
    border-bottom-color: rgba(255, 255, 255, 0.1);

    .navbar-brand .brand-name {
      color: #fff;
    }

    .user-profile .username {
      color: #fff;
    }
  }

  .info-card,
  .help-item {
    background: rgba(45, 45, 45, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;

    .info-value,
    .help-title {
      color: #fff;
    }

    .info-label {
      color: #aaa;
    }
  }

  .ip-status .current-ip,
  .ip-status .no-ip {
    background: rgba(30, 30, 30, 0.8);

    .status-value {
      color: #fff;
    }
  }
}
</style>
