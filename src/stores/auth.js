import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, getProfile } from '../api'
import { ElMessage } from 'element-plus'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const admin = ref(JSON.parse(localStorage.getItem('admin') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isSuperAdmin = computed(() => admin.value?.role === 'super_admin')
  const isAdmin = computed(() => admin.value?.role === 'admin' || admin.value?.role === 'super_admin')
  const isViewer = computed(() => admin.value?.role === 'viewer')

  // 登录
  async function login(username, password) {
    try {
      const res = await apiLogin({ username, password })
      token.value = res.token
      admin.value = res.admin

      localStorage.setItem('token', res.token)
      localStorage.setItem('admin', JSON.stringify(res.admin))

      ElMessage.success('登录成功')
      router.push('/')
    } catch (error) {
      throw error
    }
  }

  // 登出
  function logout() {
    token.value = ''
    admin.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    router.push('/login')
    ElMessage.success('已退出登录')
  }

  // 获取用户信息
  async function fetchProfile() {
    try {
      const profile = await getProfile()
      admin.value = profile
      localStorage.setItem('admin', JSON.stringify(profile))
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  return {
    token,
    admin,
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    isViewer,
    login,
    logout,
    fetchProfile
  }
})
