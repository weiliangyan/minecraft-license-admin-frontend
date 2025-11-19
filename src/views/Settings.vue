<template>
  <div class="settings-bg">
    <div class="settings-container">
      <!-- 页面标题区域 -->
      <div class="page-header">
        <div class="header-content glass-card">
          <div class="title-icon">
            <el-icon :size="32" color="#409eff"><Setting /></el-icon>
          </div>
          <div class="title-info">
            <h1 class="page-title">系统设置</h1>
            <p class="page-subtitle">管理您的账户信息和系统偏好</p>
          </div>
        </div>
      </div>

      <!-- 设置选项卡 -->
      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" class="settings-tabs" tab-position="top">
          <!-- 个人资料选项卡 -->
          <el-tab-pane name="profile">
            <template #label>
              <div class="tab-label">
                <el-icon><User /></el-icon>
                <span>个人资料</span>
              </div>
            </template>

            <div class="tab-content">
              <el-row :gutter="24">
                <el-col :xs="24" :sm="24" :md="12">
                  <div class="glass-card info-card">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><User /></el-icon>
                      </div>
                      <h3 class="card-title">基本信息</h3>
                    </div>
                    <div class="info-content">
                      <div class="info-item">
                        <div class="info-label">
                          <el-icon><User /></el-icon>
                          <span>用户名</span>
                        </div>
                        <div class="info-value">{{ authStore.admin?.username }}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">
                          <el-icon><Message /></el-icon>
                          <span>邮箱</span>
                        </div>
                        <div class="info-value">{{ authStore.admin?.email }}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">
                          <el-icon><Check /></el-icon>
                          <span>角色</span>
                        </div>
                        <div class="info-value">
                          <el-tag :type="getRoleType(authStore.admin?.role)" effect="light">
                            {{ getRoleText(authStore.admin?.role) }}
                          </el-tag>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">
                          <el-icon><Clock /></el-icon>
                          <span>最后登录</span>
                        </div>
                        <div class="info-value">{{ authStore.admin?.last_login ? formatDate(authStore.admin.last_login) : '暂无记录' }}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">
                          <el-icon><Calendar /></el-icon>
                          <span>账户创建</span>
                        </div>
                        <div class="info-value">{{ formatDate(authStore.admin?.created_at) }}</div>
                      </div>
                    </div>
                  </div>
                </el-col>

                <el-col :xs="24" :sm="24" :md="12">
                  <div class="glass-card form-card">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><Message /></el-icon>
                      </div>
                      <h3 class="card-title">修改邮箱</h3>
                    </div>
                    <div class="form-content">
                      <el-form
                        ref="emailFormRef"
                        :model="emailForm"
                        :rules="emailRules"
                        label-position="top"
                        class="settings-form"
                      >
                        <el-form-item label="新邮箱地址" prop="email">
                          <div class="input-wrapper">
                            <el-input
                              v-model="emailForm.email"
                              placeholder="请输入新的邮箱地址"
                              size="large"
                              clearable
                            >
                              <template #prefix>
                                <el-icon class="input-icon"><Message /></el-icon>
                              </template>
                            </el-input>
                          </div>
                        </el-form-item>
                        <el-form-item>
                          <el-button
                            type="primary"
                            size="large"
                            :loading="emailLoading"
                            class="action-btn"
                            @click="handleUpdateEmail"
                          >
                            <el-icon class="btn-icon"><Message /></el-icon>
                            更新邮箱
                          </el-button>
                        </el-form-item>
                      </el-form>
                    </div>
                  </div>

                  <div class="glass-card form-card" style="margin-top: 24px;">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><Lock /></el-icon>
                      </div>
                      <h3 class="card-title">修改密码</h3>
                    </div>
                    <div class="form-content">
                      <el-form
                        ref="passwordFormRef"
                        :model="passwordForm"
                        :rules="passwordRules"
                        label-position="top"
                        class="settings-form"
                      >
                        <el-form-item label="当前密码" prop="currentPassword">
                          <div class="input-wrapper">
                            <el-input
                              v-model="passwordForm.currentPassword"
                              type="password"
                              placeholder="请输入当前密码"
                              size="large"
                              show-password
                            >
                              <template #prefix>
                                <el-icon class="input-icon"><Lock /></el-icon>
                              </template>
                            </el-input>
                          </div>
                        </el-form-item>
                        <el-form-item label="新密码" prop="newPassword">
                          <div class="input-wrapper">
                            <el-input
                              v-model="passwordForm.newPassword"
                              type="password"
                              placeholder="请输入新密码"
                              size="large"
                              show-password
                            >
                              <template #prefix>
                                <el-icon class="input-icon"><Key /></el-icon>
                              </template>
                            </el-input>
                          </div>
                        </el-form-item>
                        <el-form-item label="确认密码" prop="confirmPassword">
                          <div class="input-wrapper">
                            <el-input
                              v-model="passwordForm.confirmPassword"
                              type="password"
                              placeholder="请再次输入新密码"
                              size="large"
                              show-password
                            >
                              <template #prefix>
                                <el-icon class="input-icon"><Lock /></el-icon>
                              </template>
                            </el-input>
                          </div>
                        </el-form-item>
                        <el-form-item>
                          <el-button
                            type="primary"
                            size="large"
                            :loading="passwordLoading"
                            class="action-btn"
                            @click="handleUpdatePassword"
                          >
                            <el-icon class="btn-icon"><Lock /></el-icon>
                            修改密码
                          </el-button>
                        </el-form-item>
                      </el-form>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <!-- 系统设置选项卡 -->
          <el-tab-pane name="system">
            <template #label>
              <div class="tab-label">
                <el-icon><Monitor /></el-icon>
                <span>系统设置</span>
              </div>
            </template>

            <div class="tab-content">
              <el-row :gutter="24">
                <el-col :xs="24" :sm="24" :md="12">
                  <div class="glass-card form-card">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><Brush /></el-icon>
                      </div>
                      <h3 class="card-title">外观设置</h3>
                    </div>
                    <div class="form-content">
                      <el-form label-position="top" class="settings-form">
                        <el-form-item label="主题模式">
                          <div class="theme-options">
                            <div
                              v-for="theme in [
                                { label: '浅色模式', value: 'light', icon: Sunny },
                                { label: '深色模式', value: 'dark', icon: Moon },
                                { label: '跟随系统', value: 'auto', icon: Monitor }
                              ]"
                              :key="theme.value"
                              class="theme-option"
                              :class="{ active: themeMode === theme.value }"
                              @click="themeMode = theme.value; handleThemeChange(theme.value)"
                            >
                              <el-icon><component :is="theme.icon" /></el-icon>
                              <span>{{ theme.label }}</span>
                            </div>
                          </div>
                        </el-form-item>
                      </el-form>
                    </div>
                  </div>

                  <div class="glass-card form-card" style="margin-top: 24px;">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><Bell /></el-icon>
                      </div>
                      <h3 class="card-title">通知设置</h3>
                    </div>
                    <div class="form-content">
                      <el-form label-position="top" class="settings-form">
                        <el-form-item label="语言">
                          <el-select v-model="language" disabled style="width: 100%">
                            <el-option label="简体中文" value="zh-CN" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="自动刷新">
                          <el-switch
                            v-model="autoRefresh"
                            active-text="启用"
                            inactive-text="禁用"
                            @change="handleAutoRefreshChange"
                          />
                        </el-form-item>
                      </el-form>
                    </div>
                  </div>
                </el-col>

                <el-col :xs="24" :sm="24" :md="12">
                  <div class="glass-card form-card">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><Delete /></el-icon>
                      </div>
                      <h3 class="card-title">数据管理</h3>
                    </div>
                    <div class="form-content">
                      <el-form label-position="top" class="settings-form">
                        <el-form-item label="清除缓存">
                          <el-button
                            type="warning"
                            size="large"
                            :icon="Delete"
                            @click="handleClearCache"
                            style="width: 100%"
                          >
                            清除本地缓存
                          </el-button>
                        </el-form-item>
                        <el-alert
                          title="清除缓存将删除所有本地存储的数据，您需要重新登录"
                          type="warning"
                          :closable="false"
                          show-icon
                          style="margin-top: 12px"
                        />
                      </el-form>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <!-- 关于系统选项卡 -->
          <el-tab-pane name="about">
            <template #label>
              <div class="tab-label">
                <el-icon><InfoFilled /></el-icon>
                <span>关于系统</span>
              </div>
            </template>

            <div class="tab-content">
              <el-row :gutter="24">
                <el-col :xs="24" :sm="24" :md="12">
                  <div class="glass-card about-card">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><InfoFilled /></el-icon>
                      </div>
                      <h3 class="card-title">系统信息</h3>
                    </div>
                    <div class="about-content">
                      <div class="logo-section">
                        <el-icon :size="60" color="#409EFF"><Box /></el-icon>
                        <h2>Minecraft 插件授权管理系统</h2>
                        <p class="version">版本 1.0.0</p>
                      </div>
                      <el-divider />
                      <div class="description">
                        <p>
                          这是一个专为 Minecraft 插件开发者设计的授权管理系统，
                          提供完整的许可证管理、验证、统计分析等功能。
                        </p>
                        <p>
                          系统支持多种授权类型，包括永久授权、时间限制授权和试用授权，
                          并提供实时的授权验证服务和详细的日志记录。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="glass-card about-card" style="margin-top: 24px;">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><Link /></el-icon>
                      </div>
                      <h3 class="card-title">相关链接</h3>
                    </div>
                    <div class="links">
                      <el-link
                        href="https://github.com"
                        target="_blank"
                        :icon="Link"
                        type="primary"
                        style="margin-bottom: 12px; display: block"
                      >
                        GitHub 仓库
                      </el-link>
                      <el-link
                        href="https://docs.example.com"
                        target="_blank"
                        :icon="Document"
                        type="primary"
                        style="margin-bottom: 12px; display: block"
                      >
                        使用文档
                      </el-link>
                      <el-link
                        href="https://support.example.com"
                        target="_blank"
                        :icon="Service"
                        type="primary"
                        style="display: block"
                      >
                        技术支持
                      </el-link>
                    </div>
                  </div>
                </el-col>

                <el-col :xs="24" :sm="24" :md="12">
                  <div class="glass-card about-card">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><Cpu /></el-icon>
                      </div>
                      <h3 class="card-title">技术栈</h3>
                    </div>
                    <div class="tech-stack">
                      <div class="tech-category">
                        <h4>前端技术</h4>
                        <ul>
                          <li>
                            <el-tag>Vue 3</el-tag>
                            <span>渐进式 JavaScript 框架</span>
                          </li>
                          <li>
                            <el-tag type="success">Element Plus</el-tag>
                            <span>Vue 3 组件库</span>
                          </li>
                          <li>
                            <el-tag type="warning">Pinia</el-tag>
                            <span>状态管理</span>
                          </li>
                          <li>
                            <el-tag type="danger">Vue Router</el-tag>
                            <span>路由管理</span>
                          </li>
                        </ul>
                      </div>
                      <div class="tech-category">
                        <h4>后端技术</h4>
                        <ul>
                          <li>
                            <el-tag>Node.js</el-tag>
                            <span>JavaScript 运行时</span>
                          </li>
                          <li>
                            <el-tag type="success">Express</el-tag>
                            <span>Web 应用框架</span>
                          </li>
                          <li>
                            <el-tag type="warning">MySQL</el-tag>
                            <span>关系型数据库</span>
                          </li>
                          <li>
                            <el-tag type="danger">JWT</el-tag>
                            <span>身份认证</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div class="glass-card about-card" style="margin-top: 24px;">
                    <div class="card-header">
                      <div class="header-icon">
                        <el-icon :size="20" color="#409eff"><InfoFilled /></el-icon>
                      </div>
                      <h3 class="card-title">版权信息</h3>
                    </div>
                    <div class="copyright">
                      <p>© 2024 Minecraft License Management System</p>
                      <p>All Rights Reserved</p>
                      <el-divider />
                      <p class="license">
                        本系统采用 MIT 许可证开源
                      </p>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  User,
  Message,
  Lock,
  Sunny,
  Setting,
  Delete,
  InfoFilled,
  Link,
  Document,
  Service,
  Cpu,
  Box,
  Check,
  Clock,
  Calendar,
  Monitor,
  Bell,
  Brush,
  Key,
  Moon,
} from '@element-plus/icons-vue';
import { useAuthStore } from '../stores/auth';
import { formatDate } from '../utils';
import { updateAdminPassword } from '../api';

const authStore = useAuthStore();

const activeTab = ref('profile');
const emailLoading = ref(false);
const passwordLoading = ref(false);
const themeMode = ref('light');
const language = ref('zh-CN');
const autoRefresh = ref(false);

const emailFormRef = ref(null);
const passwordFormRef = ref(null);

const emailForm = reactive({
  email: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const getRoleType = (role) => {
  const types = {
    super_admin: 'danger',
    admin: 'primary',
    viewer: 'success',
  };
  return types[role] || 'info';
};

const getRoleText = (role) => {
  const texts = {
    super_admin: '超级管理员',
    admin: '管理员',
    viewer: '查看者',
  };
  return texts[role] || role;
};

const handleUpdateEmail = async () => {
  try {
    await emailFormRef.value.validate();
    emailLoading.value = true;
    // API call would go here
    ElMessage.success('邮箱更新成功');
    emailForm.email = '';
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response?.data?.message || '更新邮箱失败');
    }
  } finally {
    emailLoading.value = false;
  }
};

const handleUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate();
    passwordLoading.value = true;

    await updateAdminPassword(authStore.admin.id, {
      currentPassword: passwordForm.currentPassword,
      password: passwordForm.newPassword,
    });

    ElMessage.success('密码修改成功，请重新登录');

    // Clear form
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    // Logout after 2 seconds
    setTimeout(() => {
      authStore.logout();
    }, 2000);
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '修改密码失败');
  } finally {
    passwordLoading.value = false;
  }
};

const handleThemeChange = (theme) => {
  // In a real implementation, this would update the theme store
  ElMessage.success(`主题已切换为: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}`);
};

const handleAutoRefreshChange = (enabled) => {
  localStorage.setItem('autoRefresh', enabled.toString());
  ElMessage.success(enabled ? '自动刷新已启用' : '自动刷新已禁用');
};

const handleClearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '清除缓存将删除所有本地存储的数据，您需要重新登录。确定要继续吗？',
      '确认清除缓存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    localStorage.clear();
    sessionStorage.clear();
    ElMessage.success('缓存清除成功，即将重新加载页面');

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    // User cancelled
  }
};

onMounted(() => {
  // Load saved preferences
  const savedAutoRefresh = localStorage.getItem('autoRefresh');
  if (savedAutoRefresh) {
    autoRefresh.value = savedAutoRefresh === 'true';
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    themeMode.value = savedTheme;
  }
});
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables.scss';

.settings-bg {
  min-height: 100vh;
  background: $bg-secondary;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 15s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(41, 182, 246, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 12s ease-in-out infinite reverse;
  }
}

.settings-container {
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

.page-header {
  margin-bottom: 32px;

  .header-content {
    padding: 24px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(245, 249, 255, 0.8);
    box-shadow: $shadow-soft;
    border-radius: 20px;
    transition: $transition-base;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-hover;
    }

    .title-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
      animation: float-icon 3s ease-in-out infinite;
    }

    .title-info {
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
        font-weight: 500;
      }
    }
  }
}

.tabs-wrapper {
  .settings-tabs {
    background: transparent;

    :deep(.el-tabs__header) {
      margin-bottom: 32px;
      background: rgba(245, 249, 255, 0.8);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        display: none;
      }
    }

    :deep(.el-tabs__nav) {
      border: none;
      gap: 8px;
    }

    :deep(.el-tabs__item) {
      border: none;
      padding: 0;
      margin: 0;
      font-size: 15px;
      font-weight: 500;
      color: #666;
      background: transparent;
      border-radius: 12px;
      transition: $transition-base;

      &.is-active {
        color: #409eff;
        background: rgba(64, 158, 255, 0.1);
      }

      &:hover {
        color: #409eff;
        background: rgba(64, 158, 255, 0.05);
      }
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      transition: $transition-base;

      .el-icon {
        font-size: 18px;
      }
    }
  }

  .tab-content {
    .glass-card {
      padding: 24px;
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(245, 249, 255, 0.8);
      box-shadow: $shadow-soft;
      border-radius: 16px;
      transition: $transition-base;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-hover;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(64, 158, 255, 0.1);

        .header-icon {
          width: 40px;
          height: 40px;
          background: rgba(64, 158, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #333;
        }
      }

      .form-content {
        .settings-form {
          :deep(.el-form-item__label) {
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
          }

          .input-wrapper {
            .modern-input {
              :deep(.el-input__wrapper) {
                border-radius: 12px;
                padding: 14px 16px;
                border: 2px solid rgba(64, 158, 255, 0.1);
                background: rgba(249, 250, 251, 0.8);
                backdrop-filter: blur(10px);
                transition: $transition-base;

                &:hover {
                  border-color: rgba(64, 158, 255, 0.3);
                  background: rgba(255, 255, 255, 0.95);
                  transform: translateY(-1px);
                }

                &.is-focus {
                  border-color: #409eff;
                  background: rgba(255, 255, 255, 0.95);
                  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
                }
              }

              .input-icon {
                color: #409eff;
                font-size: 16px;
              }
            }
          }

          .action-btn {
            width: 100%;
            height: 48px;
            border-radius: 24px;
            background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
            border: none;
            font-size: 15px;
            font-weight: 600;
            color: white;
            box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
            transition: $transition-base;
            border: 2px solid transparent;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 32px rgba(64, 158, 255, 0.4);
              background: linear-gradient(135deg, #29b6f6 0%, #409eff 100%);
            }

            .btn-icon {
              margin-left: 8px;
              font-size: 14px;
              transition: transform 0.3s;
            }

            &:hover .btn-icon {
              transform: translateX(2px);
            }
          }
        }

        .theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;

          .theme-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px 12px;
            border-radius: 12px;
            border: 2px solid rgba(64, 158, 255, 0.1);
            background: rgba(249, 250, 251, 0.8);
            cursor: pointer;
            transition: $transition-base;

            &:hover {
              border-color: rgba(64, 158, 255, 0.3);
              background: rgba(255, 255, 255, 0.95);
              transform: translateY(-2px);
            }

            &.active {
              border-color: #409eff;
              background: rgba(64, 158, 255, 0.1);
              box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
            }

            .el-icon {
              font-size: 24px;
              color: #409eff;
            }

            span {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
          }
        }
      }

      .info-content {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(64, 158, 255, 0.08);

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 500;
            color: #666;

            .el-icon {
              font-size: 16px;
              color: #409eff;
            }
          }

          .info-value {
            font-size: 15px;
            font-weight: 500;
            color: #333;
          }
        }
      }

      .about-content {
        .logo-section {
          text-align: center;
          padding: 20px 0;

          h2 {
            margin: 15px 0 5px;
            font-size: 24px;
            color: var(--el-text-color-primary);
          }

          .version {
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
        }

        .description {
          p {
            line-height: 1.8;
            color: var(--el-text-color-regular);
            margin: 10px 0;
          }
        }
      }

      .links {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 10px 0;

        .el-link {
          font-size: 16px;
        }
      }

      .tech-stack {
        .tech-category {
          margin-bottom: 30px;

          &:last-child {
            margin-bottom: 0;
          }

          h4 {
            margin: 0 0 15px;
            font-size: 18px;
            color: var(--el-text-color-primary);
          }

          ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 10px 0;
              border-bottom: 1px solid var(--el-border-color-lighter);

              &:last-child {
                border-bottom: none;
              }

              span {
                color: var(--el-text-color-regular);
                font-size: 14px;
              }
            }
          }
        }
      }

      .copyright {
        text-align: center;
        padding: 20px 0;

        p {
          margin: 8px 0;
          color: var(--el-text-color-regular);
          font-size: 14px;

          &.license {
            color: var(--el-text-color-secondary);
            font-size: 13px;
          }
        }
      }
    }
  }
}

// 动画定义
@keyframes float-icon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(2deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(3deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .settings-container {
    padding: 20px 10px;

    .page-header .header-content {
      flex-direction: column;
      text-align: center;
      padding: 20px;
      gap: 16px;

      .title-info {
        .page-title {
          font-size: 24px;
        }

        .page-subtitle {
          font-size: 14px;
        }
      }
    }

    .tabs-wrapper {
      :deep(.el-tabs__header) {
        padding: 6px;
      }

      :deep(.el-tabs__item) {
        font-size: 14px;

        .tab-label {
          padding: 10px 16px;
          gap: 6px;

          .el-icon {
            font-size: 16px;
          }
        }
      }

      .tab-content {
        .glass-card {
          padding: 20px;

          .card-header {
            .header-icon {
              width: 36px;
              height: 36px;
            }

            .card-title {
              font-size: 16px;
            }
          }

          .form-content {
            .theme-options {
              grid-template-columns: 1fr;
            }
          }
        }
      }
    }
  }
}

// 深色模式支持
html.dark {
  .settings-bg {
    background: $bg-secondary;
  }

  .page-header .header-content {
    background: rgba(45, 45, 45, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tabs-wrapper {
    :deep(.el-tabs__header) {
      background: rgba(45, 45, 45, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .glass-card {
      background: rgba(45, 45, 45, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .card-header {
        border-bottom-color: rgba(255, 255, 255, 0.1);

        .card-title {
          color: #fff;
        }
      }

      .info-content {
        .info-item {
          border-bottom-color: rgba(255, 255, 255, 0.1);

          .info-label {
            color: #aaa;
          }

          .info-value {
            color: #fff;
          }
        }
      }

      .form-content {
        .theme-options {
          .theme-option {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);

            span {
              color: #fff;
            }
          }
        }
      }
    }
  }
}
</style>