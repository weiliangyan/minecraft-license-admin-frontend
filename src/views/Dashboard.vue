<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner glass-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            欢迎回来，{{ authStore.admin?.username }}！
          </h1>
          <p class="welcome-subtitle">{{ getWelcomeMessage() }}</p>
        </div>
        <div class="welcome-stats">
          <div class="quick-stat">
            <span class="stat-number">{{ stats.totalLicenses || 0 }}</span>
            <span class="stat-label">总授权</span>
          </div>
          <div class="quick-stat">
            <span class="stat-number">{{ stats.todayVerifications || 0 }}</span>
            <span class="stat-label">今日验证</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in statCards" :key="index">
        <div class="glass-card stat-card" :class="`hover-effect-${index}`" @click="handleStatClick(item)">
          <div class="stat-icon" :style="{ background: item.gradient }">
            <el-icon :size="28"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-trend" :class="item.trendClass">
              <el-icon v-if="item.trend > 0"><CaretTop /></el-icon>
              <el-icon v-else-if="item.trend < 0"><CaretBottom /></el-icon>
              <span>{{ item.trendText }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <div class="glass-card quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="action-buttons">
        <el-button type="primary" :icon="Plus" size="large" @click="$router.push('/licenses')">
          新建授权
        </el-button>
        <el-button type="success" :icon="Upload" size="large" @click="handleBatchImport">
          批量导入
        </el-button>
        <el-button type="warning" :icon="Bell" size="large" @click="handleSendExpiryNotification">
          发送过期提醒
        </el-button>
        <el-button type="info" :icon="Download" size="large" @click="handleExportData">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <div class="glass-card chart-card">
          <div class="card-header">
            <h3 class="section-title">验证趋势分析</h3>
            <el-radio-group v-model="trendPeriod" size="small" @change="loadVerificationTrend">
              <el-radio-button label="7d">7天</el-radio-button>
              <el-radio-button label="30d">30天</el-radio-button>
              <el-radio-button label="90d">90天</el-radio-button>
            </el-radio-group>
          </div>
          <div v-loading="chartLoading" class="chart-container">
            <v-chart class="chart" :option="verificationTrendOption" autoresize />
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="8">
        <div class="glass-card chart-card">
          <div class="card-header">
            <h3 class="section-title">授权状态分布</h3>
          </div>
          <div v-loading="chartLoading" class="chart-container">
            <v-chart class="chart" :option="licenseDistributionOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <div class="glass-card recent-activity">
      <div class="card-header">
        <h3 class="section-title">最近验证活动</h3>
        <el-button type="primary" link @click="viewAllLogs">
          查看全部
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div v-loading="logsLoading" class="activity-list">
        <div v-if="recentLogs.length === 0" class="empty-state">
          <el-icon :size="48" color="#ddd"><Document /></el-icon>
          <p>暂无验证记录</p>
        </div>
        <div v-else class="activity-items">
          <div v-for="(log, index) in recentLogs" :key="index" class="activity-item glass-card">
            <div class="activity-icon" :class="log.success ? 'success' : 'failed'">
              <el-icon>
                <CircleCheck v-if="log.success" />
                <CircleClose v-else />
              </el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-header">
                <span class="license-key">{{ log.licenseKey }}</span>
                <el-tag :type="log.success ? 'success' : 'danger'" size="small">
                  {{ log.success ? '成功' : '失败' }}
                </el-tag>
              </div>
              <div class="activity-details">
                <span class="ip-address">{{ log.ip }}</span>
                <span class="separator">•</span>
                <span class="time">{{ formatDate(log.timestamp) }}</span>
              </div>
              <div class="activity-message" v-if="log.message">
                {{ log.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Ticket,
  CircleCheck,
  TrendCharts,
  Warning,
  ArrowRight,
  CaretTop,
  CaretBottom,
  Plus,
  Upload,
  Bell,
  Download,
  Document,
  CircleClose
} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { useAuthStore } from '../stores/auth'
import { getDashboardStats, getRecentLogs } from '../api'
import { formatDate } from '../utils'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const router = useRouter()
const authStore = useAuthStore()

// State
const stats = ref({
  totalLicenses: 0,
  totalLicensesChange: 0,
  activeLicenses: 0,
  todayVerifications: 0,
  todayVerificationsChange: 0,
  expiringSoon: 0
})

// Computed stat cards
const statCards = computed(() => [
  {
    label: '总授权数',
    value: stats.value.totalLicenses || 0,
    icon: 'Ticket',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: stats.value.totalLicensesChange,
    trendText: stats.value.totalLicensesChange > 0 ? `较上月 ${stats.value.totalLicensesChange}%` : '无变化',
    trendClass: stats.value.totalLicensesChange > 0 ? 'positive' : 'neutral'
  },
  {
    label: '活跃授权',
    value: stats.value.activeLicenses || 0,
    icon: 'CircleCheck',
    gradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
    trend: 0,
    trendText: `占比 ${calculatePercentage(stats.value.activeLicenses, stats.value.totalLicenses)}%`,
    trendClass: 'positive'
  },
  {
    label: '今日验证',
    value: stats.value.todayVerifications || 0,
    icon: 'TrendCharts',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    trend: stats.value.todayVerificationsChange,
    trendText: stats.value.todayVerificationsChange > 0 ? `较昨日 ${stats.value.todayVerificationsChange}%` : '与昨日相同',
    trendClass: stats.value.todayVerificationsChange > 0 ? 'positive' : 'neutral'
  },
  {
    label: '即将过期',
    value: stats.value.expiringSoon || 0,
    icon: 'Warning',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    trend: 0,
    trendText: '未来7天内',
    trendClass: stats.value.expiringSoon > 0 ? 'warning' : 'neutral'
  }
])

const recentLogs = ref([])
const logsLoading = ref(false)
const chartLoading = ref(false)
const trendPeriod = ref('7d')

const verificationTrendData = ref({
  dates: [],
  successful: [],
  failed: []
})

const licenseTypeData = ref({
  types: [],
  counts: []
})

// Auto-refresh interval
let refreshInterval = null

// Computed
const verificationTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['成功', '失败'],
    bottom: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: verificationTrendData.value.dates
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '成功',
      type: 'line',
      smooth: true,
      data: verificationTrendData.value.successful,
      itemStyle: {
        color: '#67C23A'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ]
        }
      }
    },
    {
      name: '失败',
      type: 'line',
      smooth: true,
      data: verificationTrendData.value.failed,
      itemStyle: {
        color: '#F56C6C'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ]
        }
      }
    }
  ]
}))

const licenseDistributionOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    bottom: 0
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: licenseTypeData.value.types.map((type, index) => ({
        name: type,
        value: licenseTypeData.value.counts[index]
      })),
      color: ['#667eea', '#f093fb', '#4facfe', '#fa709a', '#feca57']
    }
  ]
}))

// Methods
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好！今天也要元气满满哦~'
  if (hour < 18) return '下午好！工作再忙也要注意休息~'
  return '晚上好！今天辛苦了，早点休息吧~'
}

const handleStatClick = (item) => {
  // 根据点击的统计卡片跳转到相应页面
  switch (item.label) {
    case '总授权数':
    case '活跃授权':
    case '即将过期':
      router.push('/licenses')
      break
    case '今日验证':
      router.push('/logs')
      break
  }
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleSendExpiryNotification = () => {
  ElMessage.info('发送过期提醒功能开发中...')
}

const handleExportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const getStatusType = (status) => {
  const statusMap = {
    success: 'success',
    failed: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return statusMap[status.toLowerCase()] || 'info'
}

const loadDashboardStats = async () => {
  try {
    const response = await getDashboardStats()
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
    ElMessage.error('加载仪表盘统计数据失败')
  }
}

const loadRecentLogs = async () => {
  logsLoading.value = true
  try {
    const response = await getRecentLogs({ limit: 10 })
    if (response.success) {
      recentLogs.value = response.data
    }
  } catch (error) {
    console.error('Failed to load recent logs:', error)
    ElMessage.error('加载最近日志失败')
  } finally {
    logsLoading.value = false
  }
}

const loadVerificationTrend = async () => {
  chartLoading.value = true
  try {
    // Simulate API call - Replace with actual API
    const days = parseInt(trendPeriod.value)
    const dates = []
    const successful = []
    const failed = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      successful.push(Math.floor(Math.random() * 100) + 50)
      failed.push(Math.floor(Math.random() * 30) + 5)
    }

    verificationTrendData.value = { dates, successful, failed }
  } catch (error) {
    console.error('Failed to load verification trend:', error)
    ElMessage.error('加载验证趋势失败')
  } finally {
    chartLoading.value = false
  }
}

const loadLicenseDistribution = async () => {
  try {
    // Simulate API call - Replace with actual API
    licenseTypeData.value = {
      types: ['Premium', 'Standard', 'Trial', 'Lifetime', 'Enterprise'],
      counts: [45, 30, 15, 8, 12]
    }
  } catch (error) {
    console.error('Failed to load license distribution:', error)
    ElMessage.error('加载授权分布失败')
  }
}

const loadAllData = async () => {
  await Promise.all([
    loadDashboardStats(),
    loadRecentLogs(),
    loadVerificationTrend(),
    loadLicenseDistribution()
  ])
}

const viewAllLogs = () => {
  router.push('/logs')
}

// Lifecycle
onMounted(() => {
  loadAllData()

  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(() => {
    loadAllData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 0;
  min-height: 100vh;

  .welcome-banner {
    margin-bottom: 24px;
    padding: 32px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(41, 182, 246, 0.05) 100%);

    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;

      .welcome-text {
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

      .welcome-stats {
        display: flex;
        gap: 32px;

        .quick-stat {
          text-align: center;

          .stat-number {
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

  .stats-row {
    margin-bottom: 24px;

    .stat-card {
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      border-radius: 16px;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-bottom: 16px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        position: relative;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .stat-card:hover &::after {
          transform: translateX(0);
        }
      }

      .stat-info {
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
          line-height: 1;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;

          &.positive {
            color: #67c23a;
          }

          &.negative {
            color: #f56c6c;
          }

          &.warning {
            color: #e6a23c;
          }

          &.neutral {
            color: #999;
          }

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 24px;
    padding: 24px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-button {
        border-radius: 24px;
        padding: 12px 24px;
        font-weight: 500;
      }
    }
  }

  .charts-row {
    margin-bottom: 24px;

    .chart-card {
      padding: 24px;
      height: 420px;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;

        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #333;
        }
      }

      .chart-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;

        .chart {
          width: 100%;
          height: 320px;
        }
      }
    }
  }

  .recent-activity {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      .section-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: #333;
      }
    }

    .activity-list {
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;

        p {
          margin-top: 16px;
          font-size: 14px;
        }
      }

      .activity-items {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .activity-item {
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: all 0.3s;
          border-radius: 12px;

          &:hover {
            background: rgba(255, 255, 255, 0.8);
            transform: translateX(4px);
          }

          .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;

            &.success {
              background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
            }

            &.failed {
              background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
            }
          }

          .activity-content {
            flex: 1;
            min-width: 0;

            .activity-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;

              .license-key {
                font-family: 'Consolas', 'Monaco', monospace;
                font-weight: 600;
                color: #409eff;
                font-size: 14px;
              }
            }

            .activity-details {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
              font-size: 13px;
              color: #666;

              .ip-address {
                color: #409eff;
                font-weight: 500;
              }

              .separator {
                color: #ddd;
              }
            }

            .activity-message {
              font-size: 13px;
              color: #999;
              line-height: 1.4;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
    .welcome-banner {
      padding: 20px;

      .welcome-content {
        flex-direction: column;
        text-align: center;

        .welcome-stats {
          gap: 20px;
        }
      }
    }

    .stats-row {
      .stat-card {
        padding: 20px;

        .stat-icon {
          width: 50px;
          height: 50px;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 24px;
        }
      }
    }

    .quick-actions {
      .action-buttons {
        justify-content: center;

        .el-button {
          flex: 1;
          min-width: 140px;
        }
      }
    }

    .charts-row {
      .chart-card {
        height: auto;
        min-height: 350px;

        .chart-container {
          .chart {
            height: 280px;
          }
        }
      }
    }

    .recent-activity {
      .activity-items {
        .activity-item {
          padding: 12px;

          .activity-content {
            .activity-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .page-header {
      h1 {
        font-size: 24px;
      }
    }

    .stats-row {
      .stat-card {
        .stat-content {
          .stat-icon {
            width: 48px;
            height: 48px;

            .el-icon {
              font-size: 24px !important;
            }
          }

          .stat-info {
            .stat-value {
              font-size: 24px;
            }
          }
        }
      }
    }

    .charts-row {
      .chart-card {
        .chart {
          height: 280px;
        }
      }
    }
  }
}

// Dark mode adjustments
:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-bg-color: var(--el-bg-color);
  --el-table-tr-bg-color: var(--el-bg-color);
  --el-table-header-bg-color: var(--el-fill-color-light);
}
</style>
