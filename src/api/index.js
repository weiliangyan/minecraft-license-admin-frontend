import request from './request'

// ==================== 管理员API ====================

// 登录
export const login = (data) => request.post('/admin/login', data)

// 获取个人信息
export const getProfile = () => request.get('/admin/profile')

// ==================== 仪表盘API ====================

// 获取统计数据
export const getDashboardStats = () => request.get('/admin/dashboard/stats')

// 获取最近日志
export const getRecentLogs = () => request.get('/admin/dashboard/recent-logs')

// ==================== 授权码API ====================

// 获取授权列表
export const getLicenses = (params) => request.get('/admin/licenses', { params })

// 获取授权详情
export const getLicenseDetail = (id) => request.get(`/admin/licenses/${id}`)

// 创建授权
export const createLicense = (data) => request.post('/admin/licenses', data)

// 更新授权
export const updateLicense = (id, data) => request.put(`/admin/licenses/${id}`, data)

// 更新授权状态
export const updateLicenseStatus = (id, status) => request.patch(`/admin/licenses/${id}/status`, { status })

// 续期授权
export const renewLicense = (id, days) => request.patch(`/admin/licenses/${id}/renew`, { days })

// 删除授权
export const deleteLicense = (id) => request.delete(`/admin/licenses/${id}`)

// 导出授权
export const exportLicenses = () => request.get('/admin/licenses/export/all')

// ==================== 日志API ====================

// 获取验证日志
export const getLogs = (params) => request.get('/admin/logs', { params })

// ==================== 管理员管理API ====================

// 获取管理员列表
export const getAdmins = () => request.get('/admin/admins')

// 创建管理员
export const createAdmin = (data) => request.post('/admin/admins', data)

// 更新管理员
export const updateAdmin = (id, data) => request.put(`/admin/admins/${id}`, data)

// 修改管理员密码
export const updateAdminPassword = (id, password) => request.patch(`/admin/admins/${id}/password`, { password })

// 删除管理员
export const deleteAdmin = (id) => request.delete(`/admin/admins/${id}`)

// ==================== 通知API ====================

// 获取未读通知
export const getNotifications = () => request.get('/admin/notifications')

// 标记已读
export const markNotificationRead = (id) => request.patch(`/admin/notifications/${id}/read`)
