<template>
  <div class="admin-login-bg">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="decoration-section">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="brand-info">
          <div class="logo-circle glass-card">
            <el-icon :size="48" color="#409eff"><Box /></el-icon>
          </div>
          <h1 class="brand-title">授权管理系统</h1>
          <p class="brand-subtitle">License Management System</p>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>安全可靠</span>
            </div>
            <div class="feature-item">
              <el-icon><TrendCharts /></el-icon>
              <span>智能管理</span>
            </div>
            <div class="feature-item">
              <el-icon><Monitor /></el-icon>
              <span>实时监控</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-section">
        <div class="login-card glass-card">
          <div class="login-header">
            <div class="header-icon">
              <el-icon :size="32" color="#409eff"><User /></el-icon>
            </div>
            <h2 class="login-title">管理员登录</h2>
            <p class="login-subtitle">使用您的管理员账号登录系统</p>
          </div>

          <el-form
            :model="form"
            :rules="rules"
            ref="formRef"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-input
                  v-model="form.username"
                  placeholder="请输入管理员用户名"
                  size="large"
                  clearable
                  class="modern-input"
                >
                  <template #prefix>
                    <el-icon class="input-icon"><User /></el-icon>
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请输入登录密码"
                  size="large"
                  clearable
                  show-password
                  class="modern-input"
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
                :loading="loading"
                class="login-btn"
                native-type="submit"
                @click="handleLogin"
              >
                <el-icon class="btn-icon"><Right /></el-icon>
                安全登录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="security-tips">
            <div class="tips-header">
              <el-icon><InfoFilled /></el-icon>
              <span>安全提示</span>
            </div>
            <div class="tips-content">
              <div class="tip-item">
                <el-icon><CircleCheck /></el-icon>
                <span>请确保在安全的网络环境中登录</span>
              </div>
              <div class="tip-item">
                <el-icon><CircleCheck /></el-icon>
                <span>定期更改密码以提高账户安全性</span>
              </div>
              <div class="tip-item">
                <el-icon><CircleCheck /></el-icon>
                <span>登录失败多次将暂时锁定账户</span>
              </div>
            </div>
          </div>

          <div class="back-link">
            <el-button type="info" link @click="goToCustomer">
              <el-icon><ArrowRight /></el-icon>
              前往客户门户
            </el-button>
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="footer-decoration">
          <div class="wave-animation"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Right,
  Box,
  Check,
  TrendCharts,
  Monitor,
  InfoFilled,
  CircleCheck,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await authStore.login(form.username, form.password)
      ElMessage.success('登录成功！正在跳转到管理后台...')
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

const goToCustomer = () => {
  router.push('/customer/login')
}
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.admin-login-bg {
  min-height: 100vh;
  background: $bg-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(25, 118, 210, 0.15);
}

.decoration-section {
  flex: 1;
  background: $gradient-primary;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;

  .floating-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;

      &.shape-1 {
        width: 120px;
        height: 120px;
        top: 15%;
        left: 15%;
        animation-delay: 0s;
      }

      &.shape-2 {
        width: 80px;
        height: 80px;
        top: 50%;
        right: 20%;
        animation-delay: 2s;
      }

      &.shape-3 {
        width: 100px;
        height: 100px;
        bottom: 25%;
        left: 25%;
        animation-delay: 4s;
      }
    }
  }

  .brand-info {
    position: relative;
    z-index: 1;
    text-align: center;

    .logo-circle {
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      animation: pulse 3s ease-in-out infinite;
    }

    .brand-title {
      font-size: 36px;
      font-weight: 800;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
      text-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);
    }

    .brand-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 30px 0;
      font-weight: 500;
      letter-spacing: 1px;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        color: rgba(255, 255, 255, 0.95);
        font-size: 14px;
        font-weight: 500;
        animation: slideInLeft 0.5s ease-out;

        .el-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
        }
      }
    }
  }
}

.login-section {
  flex: 1;
  background: $bg-secondary;
  padding: 60px 50px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .login-card {
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(245, 249, 255, 0.8);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(25, 118, 210, 0.08);
    width: 100%;
    max-width: 450px;
    margin: 0 auto;

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      .header-icon {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
        animation: float-icon 3s ease-in-out infinite;
      }

      .login-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 10px 0;
        background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .login-subtitle {
        font-size: 14px;
        color: #666;
        margin: 0;
        font-weight: 500;
      }
    }

    .login-form {
      .input-wrapper {
        margin-bottom: 10px;

        .modern-input {
          :deep(.el-input__wrapper) {
            border-radius: 16px;
            padding: 16px 20px;
            border: 2px solid rgba(64, 158, 255, 0.1);
            background: rgba(249, 250, 251, 0.8);
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

            &:hover {
              border-color: rgba(64, 158, 255, 0.3);
              background: rgba(255, 255, 255, 0.95);
              transform: translateY(-2px);
            }

            &.is-focus {
              border-color: #409eff;
              background: rgba(255, 255, 255, 0.95);
              box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
            }
          }

          :deep(.el-input__inner) {
            font-size: 15px;
            color: #333;
            font-weight: 500;
          }

          .input-icon {
            color: #409eff;
            font-size: 18px;
          }
        }
      }

      .login-btn {
        width: 100%;
        height: 50px;
        border-radius: 25px;
        background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
        border: none;
        font-size: 16px;
        font-weight: 600;
        color: white;
        box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        border: 2px solid transparent;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(64, 158, 255, 0.4);
          background: linear-gradient(135deg, #29b6f6 0%, #409eff 100%);
        }

        &:active {
          transform: translateY(-2px);
        }

        .btn-icon {
          margin-left: 8px;
          font-size: 16px;
          transition: transform 0.3s;
        }

        &:hover .btn-icon {
          transform: translateX(4px);
        }
      }
    }

    .security-tips {
      margin-top: 30px;
      padding: 20px;
      background: rgba(64, 158, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(64, 158, 255, 0.1);

      .tips-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        color: #409eff;
        font-weight: 600;
        font-size: 14px;

        .el-icon {
          font-size: 16px;
        }
      }

      .tips-content {
        .tip-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          color: #666;
          font-size: 13px;
          transition: all 0.3s;

          &:hover {
            color: #409eff;
            transform: translateX(4px);
          }

          .el-icon {
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(103, 194, 58, 0.1);
            border-radius: 50%;
            color: #67c23a;
            font-size: 10px;
          }
        }
      }
    }

    .back-link {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;

      .el-button {
        color: #666;
        font-size: 14px;
        padding: 8px 16px;
        border-radius: 20px;
        transition: all 0.3s;

        &:hover {
          color: #409eff;
          background: rgba(64, 158, 255, 0.05);
        }

        .el-icon {
          margin-left: 4px;
        }
      }
    }
  }

  .footer-decoration {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    overflow: hidden;

    .wave-animation {
      position: absolute;
      bottom: -50px;
      left: -50%;
      width: 200%;
      height: 100px;
      background: linear-gradient(90deg,
        rgba(64, 158, 255, 0.1) 0%,
        rgba(64, 158, 255, 0.3) 50%,
        rgba(64, 158, 255, 0.1) 100%
      );
      border-radius: 50%;
      animation: wave 8s ease-in-out infinite;
    }
  }
}

// 动画定义
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
  }
}

@keyframes float-icon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes wave {
  0% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  50% {
    transform: translateX(50%) translateY(-20px) rotate(180deg);
  }
  100% {
    transform: translateX(0) translateY(0) rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    margin: 10px;
    border-radius: 16px;
    max-width: 100%;
  }

  .decoration-section {
    padding: 40px 20px;
    min-height: 200px;

    .brand-info {
      .brand-title {
        font-size: 28px;
      }

      .brand-subtitle {
        font-size: 14px;
      }

      .feature-list {
        .feature-item {
          font-size: 13px;
        }
      }
    }
  }

  .login-section {
    padding: 30px 20px;

    .login-card {
      padding: 30px 20px;
      max-width: 100%;

      .login-header {
        margin-bottom: 30px;

        .login-title {
          font-size: 24px;
        }
      }
    }
  }
}

// 深色模式支持
html.dark {
  .admin-login-bg {
    background: $bg-secondary;
  }

  .login-section {
    .login-card {
      background: rgba(45, 45, 45, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .security-tips {
        background: rgba(64, 158, 255, 0.05);
        border-color: rgba(64, 158, 255, 0.2);

        .tips-header {
          color: #409eff;
        }

        .tips-content {
          .tip-item {
            color: #aaa;

            &:hover {
              color: #409eff;
            }
          }
        }
      }
    }
  }
}
</style>
