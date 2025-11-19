<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar glass-card">
      <div class="logo-container">
        <div class="logo-icon">
          <el-icon :size="36" color="#409eff"><Box /></el-icon>
        </div>
        <h1 v-if="!isCollapse" class="logo-text">授权管理系统</h1>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :router="true"
        class="sidebar-menu"
        background-color="transparent"
        text-color="#555"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard" :route="{ path: '/dashboard' }">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-menu-item index="/licenses" :route="{ path: '/licenses' }">
          <el-icon><Ticket /></el-icon>
          <template #title>授权管理</template>
        </el-menu-item>

        <el-menu-item index="/logs" :route="{ path: '/logs' }">
          <el-icon><Document /></el-icon>
          <template #title>验证日志</template>
        </el-menu-item>

        <el-menu-item index="/admins" :route="{ path: '/admins' }" v-if="authStore.isSuperAdmin">
          <el-icon><User /></el-icon>
          <template #title>管理员</template>
        </el-menu-item>

        <el-menu-item index="/settings" :route="{ path: '/settings' }">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>

      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon>
          <DArrowLeft v-if="!isCollapse" />
          <DArrowRight v-else />
        </el-icon>
      </div>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header glass-card">
        <div class="header-left">
          <div class="page-info">
            <h2 class="page-title">{{ currentPageTitle }}</h2>
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>

        <div class="header-right">
          <div class="action-buttons">
            <el-badge :value="unreadNotifications" :hidden="unreadNotifications === 0" class="notification-badge">
              <el-button circle class="action-btn" @click="showNotifications">
                <el-icon><Bell /></el-icon>
              </el-button>
            </el-badge>

            <el-button circle class="action-btn theme-toggle" @click="toggleTheme">
              <el-icon>
                <Sunny v-if="isDark" />
                <Moon v-else />
              </el-icon>
            </el-button>
          </div>

          <el-dropdown @command="handleUserCommand" class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="36" class="user-avatar" :style="{ background: 'linear-gradient(135deg, #409eff 0%, #29b6f6 100%)' }">
                {{ userInitials }}
              </el-avatar>
              <div class="user-details" v-if="!isMobile">
                <span class="username">{{ authStore.admin?.username }}</span>
                <span class="user-role">{{ getRoleText(authStore.admin?.role) }}</span>
              </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="slide-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 通知抽屉 -->
    <el-drawer
      v-model="notificationDrawer"
      title="系统通知"
      direction="rtl"
      size="400px"
      class="notification-drawer"
    >
      <div class="notifications-container">
        <div v-if="notifications.length === 0" class="no-notifications">
          <el-icon :size="48" color="#ddd"><Bell /></el-icon>
          <p>暂无通知</p>
        </div>
        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item glass-card"
            :class="{ unread: !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon">
              <el-icon :size="20" :color="getNotificationColor(notification.type)">
                <component :is="getNotificationIcon(notification.type)" />
              </el-icon>
            </div>
            <div class="notification-content">
              <p class="notification-title">{{ notification.title }}</p>
              <p class="notification-message">{{ notification.message }}</p>
              <p class="notification-time">{{ formatDate(notification.createdAt) }}</p>
            </div>
          </div>
        </div>
        <div class="notification-actions" v-if="notifications.length > 0">
          <el-button text @click="markAllAsRead" :disabled="unreadNotifications === 0">
            全部已读
          </el-button>
          <el-button text type="danger" @click="clearAll">
            清空全部
          </el-button>
        </div>
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Odometer,
  Ticket,
  Document,
  User,
  Setting,
  Bell,
  Sunny,
  Moon,
  ArrowDown,
  SwitchButton,
  DArrowLeft,
  DArrowRight,
  Warning,
  SuccessFilled,
  InfoFilled,
  Box
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { formatDate } from '../utils'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Sidebar state
const isCollapse = ref(false)
const isMobile = ref(false)

// Theme
const isDark = computed(() => themeStore.isDark)

// User info
const userInitials = computed(() => {
  const username = authStore.admin?.username || ''
  return username.substring(0, 2).toUpperCase()
})

// Active menu
const activeMenu = computed(() => route.path)

// Current page title
const currentPageTitle = computed(() => {
  const titleMap = {
    'dashboard': '仪表盘',
    'licenses': '授权管理',
    'logs': '验证日志',
    'admins': '管理员',
    'settings': '系统设置',
    'profile': '个人资料'
  }
  return titleMap[route.path.slice(1)] || '授权管理系统'
})

// Role text helper
const getRoleText = (role) => {
  const roleMap = {
    'super_admin': '超级管理员',
    'admin': '管理员',
    'viewer': '查看者'
  }
  return roleMap[role] || '用户'
}

// Breadcrumbs
const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(item => item)
  const breadcrumbList = [{ path: '/dashboard', title: '首页' }]

  const titleMap = {
    'dashboard': '仪表盘',
    'licenses': '授权管理',
    'logs': '验证日志',
    'admins': '管理员',
    'settings': '系统设置',
    'profile': '个人资料'
  }

  let currentPath = ''
  pathArray.forEach(item => {
    currentPath += `/${item}`
    breadcrumbList.push({
      path: currentPath,
      title: titleMap[item] || item.charAt(0).toUpperCase() + item.slice(1)
    })
  })

  return breadcrumbList
})

// Notifications
const notificationDrawer = ref(false)
const notifications = ref([
  {
    id: 1,
    type: 'warning',
    title: 'License Expiring Soon',
    message: '5 licenses will expire in the next 7 days',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: 2,
    type: 'success',
    title: 'New License Created',
    message: 'License ABC123 has been created successfully',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60)
  },
  {
    id: 3,
    type: 'info',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  }
])

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// Notification polling
let notificationInterval = null

const fetchNotifications = async () => {
  // TODO: Implement API call to fetch notifications
  // This is a placeholder for the actual implementation
}

// Methods
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const showNotifications = () => {
  notificationDrawer.value = true
}

const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const clearAll = () => {
  notifications.value = []
}

const getNotificationIcon = (type) => {
  const iconMap = {
    warning: Warning,
    success: SuccessFilled,
    info: InfoFilled,
    error: Warning
  }
  return iconMap[type] || InfoFilled
}

const getNotificationColor = (type) => {
  const colorMap = {
    warning: '#E6A23C',
    success: '#67C23A',
    info: '#909399',
    error: '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '确认退出',
          {
            confirmButtonText: '退出',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await authStore.logout()
        ElMessage.success('退出成功')
        router.push('/login')
      } catch (error) {
        // User cancelled
      }
      break
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Poll for notifications every 30 seconds
  notificationInterval = setInterval(fetchNotifications, 30000)
  fetchNotifications()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  width: 100%;
  padding: 16px;
  gap: 16px;
  background: transparent;

  .main-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sidebar {
    border-right: none;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    margin: 0;
    border-radius: 16px;

    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
      margin-bottom: 10px;

      .logo-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
        border-radius: 12px;
        margin-right: 12px;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .sidebar-menu {
      border-right: none;
      flex: 1;
      overflow-y: auto;
      padding: 0 10px;

      .el-menu-item {
        border-radius: 12px;
        margin-bottom: 4px;
        transition: all 0.3s;
        height: 50px;

        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
          transform: translateX(4px);
        }

        &.is-active {
          background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(41, 182, 246, 0.1) 100%);
          color: #409eff;
          font-weight: 600;
        }

        .el-icon {
          width: 20px;
          height: 20px;
        }
      }
    }

    .collapse-btn {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #666;
      transition: all 0.3s;
      border-radius: 12px;
      margin: 10px;

      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }
    }
  }

  .header {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    margin: 0;
    border-radius: 16px;

    .page-info {
      .page-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 4px 0;
        background: linear-gradient(135deg, #333 0%, #666 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .breadcrumb {
        :deep(.el-breadcrumb__item) {
          .el-breadcrumb__inner {
            color: #666;
            font-weight: 500;

            &:hover {
              color: #409eff;
            }
          }

            &:last-child .el-breadcrumb__inner {
              color: #409eff;
              font-weight: 600;
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 8px;

        .action-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.05);
          font-size: 18px;
          color: #666;
          transition: all 0.3s;

          &:hover {
            background: #409eff;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(64, 158, 255, 0.3);
          }

          &.theme-toggle:hover {
            background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
            box-shadow: 0 8px 16px rgba(246, 211, 101, 0.3);
          }
        }

        .notification-badge {
          :deep(.el-badge__content) {
            background: linear-gradient(135deg, #f56c6c 0%, #ff9a9e 100%);
            border: 2px solid white;
          }
        }
      }

      .user-dropdown {
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 24px;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.05);

          &:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .user-avatar {
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .user-details {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .username {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              line-height: 1.2;
            }

            .user-role {
              font-size: 12px;
              color: #666;
              line-height: 1.2;
            }
          }

          .dropdown-icon {
            font-size: 14px;
            color: #999;
            transition: transform 0.3s;
          }

          &:hover .dropdown-icon {
            transform: translateY(2px);
          }
        }
      }
    }
  }

  .main-content {
    background: transparent;
    overflow-y: auto;
    padding: 0;
    flex: 1;
  }
}

.notifications-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .no-notifications {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);

    p {
      margin-top: 16px;
      font-size: 14px;
    }
  }

  .notification-list {
    flex: 1;
    overflow-y: auto;

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color);
      cursor: pointer;
      transition: background-color 0.3s;

      &.unread {
        background-color: var(--el-color-primary-light-9);
      }

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .notification-icon {
        flex-shrink: 0;
        font-size: 24px;
      }

      .notification-content {
        flex: 1;

        .notification-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 4px 0;
        }

        .notification-message {
          font-size: 13px;
          color: var(--el-text-color-regular);
          margin: 0 0 8px 0;
        }

        .notification-time {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin: 0;
        }
      }
    }
  }

  .notification-actions {
    padding: 16px;
    border-top: 1px solid var(--el-border-color);
    display: flex;
    justify-content: space-between;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .layout-container {
    .header {
      padding: 0 12px;

      .header-right {
        gap: 8px;

        .username {
          display: none;
        }
      }
    }

    .main-content {
      padding: 12px;
    }
  }
}
</style>
