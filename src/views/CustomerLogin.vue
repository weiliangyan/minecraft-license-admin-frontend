<template>
  <div class="customer-login-bg">
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
          <h1 class="brand-title">客户门户</h1>
          <p class="brand-subtitle">License Management Portal</p>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-section">
        <div class="login-card glass-card">
          <div class="login-header">
            <div class="header-icon">
              <el-icon :size="32" color="#409eff"><Key /></el-icon>
            </div>
            <h2 class="login-title">欢迎使用</h2>
            <p class="login-subtitle">使用您的授权码登录客户门户</p>
          </div>

          <el-form
            :model="loginForm"
            :rules="rules"
            ref="loginFormRef"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="license_key">
              <div class="input-wrapper">
                <el-input
                  v-model="loginForm.license_key"
                  placeholder="请输入授权码（如：XXXX-XXXX-XXXX-XXXX-XXXX）"
                  size="large"
                  clearable
                  class="modern-input"
                >
                  <template #prefix>
                    <el-icon class="input-icon"><Key /></el-icon>
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

          <div class="help-section">
            <div class="help-item">
              <el-icon><QuestionFilled /></el-icon>
              <span>忘记授权码？请联系管理员</span>
            </div>
            <div class="help-item">
              <el-icon><InfoFilled /></el-icon>
              <span>首次登录后可管理IP绑定</span>
            </div>
            <div class="help-item">
              <el-icon><Check /></el-icon>
              <span>支持授权状态实时查询</span>
            </div>
          </div>

          <div class="back-link">
            <el-button type="info" link @click="goToAdmin">
              <el-icon><ArrowLeft /></el-icon>
              返回管理后台
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
import { ElMessage } from 'element-plus'
import {
  Key,
  Right,
  Box,
  QuestionFilled,
  InfoFilled,
  Check,
  ArrowLeft
} from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  license_key: ''
})

const rules = {
  license_key: [
    { required: true, message: '请输入授权码', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i,
      message: '授权码格式不正确',
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await axios.post('/api/customer/login', {
          license_key: loginForm.license_key.toUpperCase()
        })

        // 保存Token和客户信息
        localStorage.setItem('customer_token', response.data.token)
        localStorage.setItem('customer_info', JSON.stringify(response.data.customer))

        ElMessage.success('登录成功！正在跳转到客户门户...')

        // 添加动画延迟
        setTimeout(() => {
          router.push('/customer/dashboard')
        }, 1000)
      } catch (error) {
        console.error('登录错误详情:', error)
        console.error('错误响应:', error.response)
        const errorMsg = error.response?.data?.error || error.message || '登录失败，请检查授权码'
        ElMessage.error(errorMsg)
      } finally {
        loading.value = false
      }
    }
  })
}

const goToAdmin = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.customer-login-bg {
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
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.9) 0%, rgba(41, 182, 246, 0.8) 100%);
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
        width: 100px;
        height: 100px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }

      &.shape-2 {
        width: 60px;
        height: 60px;
        top: 60%;
        right: 15%;
        animation-delay: 2s;
      }

      &.shape-3 {
        width: 80px;
        height: 80px;
        bottom: 20%;
        left: 20%;
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
      color: white;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
      text-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);
    }

    .brand-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      font-weight: 500;
      letter-spacing: 1px;
    }
  }
}

.login-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
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
    box-shadow: 0 8px 32px rgba(25, 118, 210, 0.1);
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

    .help-section {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid rgba(64, 158, 255, 0.1);

      .help-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        color: #666;
        font-size: 14px;
        transition: color 0.3s;

        &:hover {
          color: #409eff;
        }

        .el-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(64, 158, 255, 0.1);
          border-radius: 50%;
          color: #409eff;
          font-size: 12px;
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
          margin-right: 4px;
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
  .customer-login-bg {
    background: $bg-secondary;
  }

  .login-section {
    .login-card {
      background: rgba(45, 45, 45, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .login-form {
        .modern-input {
          :deep(.el-input__wrapper) {
            background: rgba(30, 30, 30, 0.8);
            border-color: rgba(255, 255, 255, 0.1);
            color: #fff;

            &:hover {
              background: rgba(40, 40, 40, 0.9);
              border-color: rgba(64, 158, 255, 0.3);
            }

            &.is-focus {
              background: rgba(50, 50, 50, 0.9);
              border-color: #409eff;
            }
          }

          :deep(.el-input__inner) {
            color: #fff;
          }
        }
      }

      .help-section {
        border-color: rgba(255, 255, 255, 0.1);

        .help-item {
          color: #aaa;

          &:hover {
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>
