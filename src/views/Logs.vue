<template>
  <div class="logs-container">
    <!-- 页面头部 -->
    <div class="page-header glass-card">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">验证日志</h1>
          <p class="page-subtitle">查看和分析授权码验证记录</p>
        </div>
        <div class="header-actions">
          <div class="action-group">
            <el-switch
              v-model="autoRefresh"
              active-text="自动刷新"
              size="large"
              @change="toggleAutoRefresh"
              class="auto-refresh-switch"
            />
          </div>
          <div class="action-group">
            <el-button type="primary" :icon="Download" size="large" @click="exportLogs">
              导出日志
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section glass-card">
      <div class="filter-header">
        <div class="filter-title">
          <el-icon :size="20" color="#409eff"><Filter /></el-icon>
          <span>筛选条件</span>
        </div>
        <el-button type="info" link :icon="Refresh" @click="resetFilters">
          重置筛选
        </el-button>
      </div>

      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-item">
            <label class="filter-label">授权码搜索</label>
            <el-input
              v-model="filters.licenseKey"
              placeholder="输入授权码关键词"
              clearable
              class="filter-input"
              @clear="fetchLogs"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="filter-item">
            <label class="filter-label">验证状态</label>
            <el-select
              v-model="filters.status"
              placeholder="选择验证状态"
              clearable
              class="filter-select"
              @change="fetchLogs"
            >
              <el-option label="全部状态" value="" />
              <el-option label="验证成功" value="success" />
              <el-option label="验证失败" value="fail" />
            </el-select>
          </div>

          <div class="filter-item">
            <label class="filter-label">时间范围</label>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="filter-date"
              @change="fetchLogs"
            />
          </div>

          <div class="filter-actions">
            <el-button type="primary" :icon="Search" size="large" @click="fetchLogs">
              搜索
            </el-button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="filter-stats">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">成功验证</span>
              <span class="stat-value">{{ stats.successCount }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon failed">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">失败验证</span>
              <span class="stat-value">{{ stats.failCount }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">总记录数</span>
              <span class="stat-value">{{ pagination.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日志表格 -->
    <div class="table-section glass-card">
      <div class="table-header">
        <div class="table-title">
          <el-icon :size="20" color="#409eff"><Document /></el-icon>
          <span>验证记录</span>
        </div>
        <div class="table-info">
          <el-tag type="info" size="small">{{ pagination.total }} 条记录</el-tag>
        </div>
      </div>

      <div class="table-content">
        <el-table
          v-loading="loading"
          :data="logs"
          class="modern-table"
          stripe
          :header-cell-style="{ background: 'transparent' }"
          :empty-text="'暂无验证记录'"
        >
          <el-table-column label="验证时间" width="180">
            <template #default="{ row }">
              <div class="time-cell">
                <div class="time-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <span class="time-text">{{ formatDate(row.created_at) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="授权码" min-width="200">
            <template #default="{ row }">
              <div class="license-cell">
                <span class="license-key">{{ row.license_key }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="客户名称" min-width="150">
            <template #default="{ row }">
              <span class="customer-name">{{ row.customer_name }}</span>
            </template>
          </el-table-column>

          <el-table-column label="服务器IP" width="150">
            <template #default="{ row }">
              <div class="ip-cell">
                <el-icon><Monitor /></el-icon>
                <span>{{ row.server_ip }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="验证状态" width="120">
            <template #default="{ row }">
              <el-tag
                :type="row.success ? 'success' : 'danger'"
                size="small"
                effect="light"
                class="status-tag"
              >
                <el-icon>
                  <CircleCheck v-if="row.success" />
                  <CircleClose v-else />
                </el-icon>
                {{ row.success ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="验证消息" min-width="250">
            <template #default="{ row }">
              <div class="message-cell">
                <span class="message-text" :title="row.message">{{ row.message }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                :icon="View"
                class="action-btn"
                @click="viewDetails(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[50, 100, 200, 500]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailsVisible"
      title="验证日志详情"
      width="700px"
      class="detail-dialog"
      :close-on-click-modal="false"
    >
      <div class="detail-content" v-if="selectedLog">
        <div class="detail-header">
          <div class="detail-status" :class="{ success: selectedLog.success, failed: !selectedLog.success }">
            <el-icon>
              <CircleCheck v-if="selectedLog.success" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ selectedLog.success ? '验证成功' : '验证失败' }}</span>
          </div>
          <div class="detail-time">
            {{ formatDate(selectedLog.created_at) }}
          </div>
        </div>

        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item label="授权码">
            <span class="detail-license">{{ selectedLog.license_key }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户名称">
            {{ selectedLog.customer_name }}
          </el-descriptions-item>
          <el-descriptions-item label="服务器IP">
            {{ selectedLog.server_ip }}
          </el-descriptions-item>
          <el-descriptions-item label="验证消息">
            {{ selectedLog.message }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理" v-if="selectedLog.user_agent">
            <div class="user-agent">{{ selectedLog.user_agent }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="额外信息" v-if="selectedLog.extra_info">
            <div class="extra-info">
              <pre>{{ JSON.stringify(JSON.parse(selectedLog.extra_info), null, 2) }}</pre>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailsVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Download,
  Search,
  Refresh,
  View,
  Filter,
  Key,
  CircleCheck,
  CircleClose,
  TrendCharts,
  Clock,
  Monitor,
  Document
} from '@element-plus/icons-vue';
import { getLogs } from '../api';
import { formatDate } from '../utils';

const loading = ref(false);
const logs = ref([]);
const autoRefresh = ref(false);
const detailsVisible = ref(false);
const selectedLog = ref(null);
const dateRange = ref([]);
let refreshInterval = null;

const filters = reactive({
  licenseKey: '',
  status: '',
});

const pagination = reactive({
  page: 1,
  pageSize: 50,
  total: 0,
});

// 统计数据
const stats = computed(() => {
  const successCount = logs.value.filter(log => log.success).length;
  const failCount = logs.value.filter(log => !log.success).length;

  return {
    successCount,
    failCount,
    totalCount: logs.value.length
  };
});

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    if (filters.licenseKey) {
      params.licenseKey = filters.licenseKey;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }

    const response = await getLogs(params);
    logs.value = response.logs;
    pagination.total = response.total;
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取日志失败');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.licenseKey = '';
  filters.status = '';
  dateRange.value = [];
  pagination.page = 1;
  fetchLogs();
};

const viewDetails = (log) => {
  selectedLog.value = log;
  detailsVisible.value = true;
};

const exportLogs = async () => {
  try {
    const params = {
      export: true,
    };

    if (filters.licenseKey) {
      params.licenseKey = filters.licenseKey;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }

    const response = await getLogs(params);

    // Convert to CSV
    const headers = ['时间', '许可证密钥', '客户名称', '服务器IP', '状态', '消息'];
    const csvContent = [
      headers.join(','),
      ...response.logs.map(log => [
        formatDate(log.created_at),
        log.license_key,
        log.customer_name,
        log.server_ip,
        log.success ? '成功' : '失败',
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().getTime()}.csv`;
    link.click();

    ElMessage.success('日志导出成功');
  } catch (error) {
    ElMessage.error('导出日志失败');
  }
};

const toggleAutoRefresh = (enabled) => {
  if (enabled) {
    refreshInterval = setInterval(() => {
      fetchLogs();
    }, 10000);
    ElMessage.success('自动刷新已启用');
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    ElMessage.info('自动刷新已禁用');
  }
};

onMounted(() => {
  fetchLogs();
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped lang="scss">
.logs-container {
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

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;

        .action-group {
          display: flex;
          align-items: center;
          gap: 12px;

          .auto-refresh-switch {
            :deep(.el-switch__label) {
              color: #666;
              font-weight: 500;
            }
          }

          .el-button {
            border-radius: 24px;
            padding: 12px 24px;
            font-weight: 500;
          }
        }
      }
    }
  }

  .filter-section {
    padding: 24px;

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .filter-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .filter-content {
      .filter-row {
        display: grid;
        grid-template-columns: 1fr 200px 250px auto;
        gap: 20px;
        align-items: end;
        margin-bottom: 24px;

        .filter-item {
          .filter-label {
            display: block;
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .filter-input,
          .filter-select,
          .filter-date {
            width: 100%;
          }
        }

        .filter-actions {
          .el-button {
            border-radius: 24px;
            padding: 12px 24px;
            font-weight: 500;
            height: 44px;
          }
        }
      }

      .filter-stats {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;

            &.success {
              background: rgba(103, 194, 58, 0.1);
              color: #67c23a;
            }

            &.failed {
              background: rgba(245, 108, 108, 0.1);
              color: #f56c6c;
            }

            &.total {
              background: rgba(64, 158, 255, 0.1);
              color: #409eff;
            }
          }

          .stat-info {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .stat-label {
              font-size: 12px;
              color: #999;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .stat-value {
              font-size: 20px;
              font-weight: 700;
              color: #333;
            }
          }
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
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .table-content {
      .modern-table {
        .time-cell {
          display: flex;
          align-items: center;
          gap: 8px;

          .time-icon {
            width: 28px;
            height: 28px;
            background: rgba(64, 158, 255, 0.1);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #409eff;
            font-size: 14px;
          }

          .time-text {
            font-size: 13px;
            color: #666;
          }
        }

        .license-cell {
          .license-key {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
            font-weight: 600;
            color: #409eff;
            background: rgba(64, 158, 255, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
          }
        }

        .customer-name {
          font-weight: 500;
          color: #333;
        }

        .ip-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
        }

        .status-tag {
          border-radius: 16px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 12px;
          }
        }

        .message-cell {
          .message-text {
            font-size: 13px;
            color: #666;
            line-height: 1.4;
            max-width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
          }
        }

        .action-btn {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 16px;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-1px);
          }
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }
  }

  .detail-dialog {
    :deep(.el-dialog__header) {
      background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
      color: white;
      padding: 20px 24px;
      margin: 0;
      border-radius: 16px 16px 0 0;

      .el-dialog__title {
        color: white;
        font-weight: 600;
      }
    }

    .detail-content {
      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 16px;
        border-radius: 12px;
        background: rgba(64, 158, 255, 0.05);

        .detail-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 20px;

          &.success {
            background: rgba(103, 194, 58, 0.1);
            color: #67c23a;
          }

          &.failed {
            background: rgba(245, 108, 108, 0.1);
            color: #f56c6c;
          }

          .el-icon {
            font-size: 18px;
          }
        }

        .detail-time {
          font-size: 14px;
          color: #666;
        }
      }

      .detail-descriptions {
        :deep(.el-descriptions__label) {
          font-weight: 500;
          color: #666;
        }

        :deep(.el-descriptions__content) {
          .detail-license {
            font-family: 'Consolas', 'Monaco', monospace;
            font-weight: 600;
            color: #409eff;
            background: rgba(64, 158, 255, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
          }

          .user-agent {
            max-width: 500px;
            overflow-x: auto;
            background: rgba(0, 0, 0, 0.05);
            padding: 8px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
          }

          .extra-info {
            max-width: 600px;
            overflow-x: auto;
            background: rgba(0, 0, 0, 0.05);
            padding: 12px;
            border-radius: 6px;

            pre {
              margin: 0;
              font-size: 12px;
              line-height: 1.4;
              color: #666;
            }
          }
        }
      }

      .dialog-footer {
        text-align: center;
        padding: 16px 0 0 0;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .logs-container {
    .filter-section .filter-content .filter-row {
      grid-template-columns: 1fr 200px 1fr;
      gap: 16px;

      .filter-actions {
        grid-column: 1 / -1;
        justify-self: start;
      }
    }
  }
}

@media (max-width: 768px) {
  .logs-container {
    padding: 16px;
    gap: 16px;

    .page-header {
      padding: 24px;

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .header-actions {
          width: 100%;
          flex-direction: column;
          gap: 12px;
        }
      }
    }

    .filter-section {
      padding: 20px;

      .filter-content {
        .filter-row {
          grid-template-columns: 1fr;
          gap: 16px;

          .filter-actions {
            justify-self: start;
          }
        }

        .filter-stats {
          flex-direction: column;

          .stat-card {
            width: 100%;
          }
        }
      }
    }

    .table-section {
      padding: 20px;

      .table-content {
        .modern-table {
          .message-cell .message-text {
            max-width: 180px;
          }
        }
      }
    }
  }
}

// 深色模式支持
html.dark {
  .logs-container {
    .page-header {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(41, 182, 246, 0.1) 100%);

      .header-text .page-subtitle {
        color: #aaa;
      }
    }

    .filter-section .filter-content .filter-stats .stat-card {
      background: rgba(45, 45, 45, 0.8);
      border-color: rgba(255, 255, 255, 0.1);

      .stat-info .stat-value {
        color: #fff;
      }
    }

    .table-content {
      .modern-table {
        .time-cell .time-text,
        .customer-name {
          color: #ccc;
        }

        .message-cell .message-text {
          color: #aaa;
        }
      }
    }
  }

  .detail-dialog .detail-content {
    .detail-header {
      background: rgba(64, 158, 255, 0.1);
    }
  }
}
</style>
