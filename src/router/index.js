import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'licenses',
        name: 'Licenses',
        component: () => import('../views/Licenses.vue'),
        meta: { title: '授权管理', icon: 'Ticket' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('../views/Logs.vue'),
        meta: { title: '验证日志', icon: 'Document' }
      },
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('../views/Admins.vue'),
        meta: { title: '管理员', icon: 'User', requiresSuperAdmin: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '设置', icon: 'Setting' }
      }
    ]
  },
  // 客户门户路由
  {
    path: '/customer/login',
    name: 'CustomerLogin',
    component: () => import('../views/CustomerLogin.vue'),
    meta: { requiresAuth: false, isCustomer: true }
  },
  {
    path: '/customer/dashboard',
    name: 'CustomerDashboard',
    component: () => import('../views/CustomerDashboard.vue'),
    meta: { requiresAuth: false, isCustomer: true, requiresCustomerAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 客户门户路由守卫
  if (to.meta.isCustomer) {
    if (to.meta.requiresCustomerAuth) {
      const customerToken = localStorage.getItem('customer_token')
      if (!customerToken) {
        next('/customer/login')
        return
      }
    }
    next()
    return
  }

  // 管理员路由守卫
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/')
  } else if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
