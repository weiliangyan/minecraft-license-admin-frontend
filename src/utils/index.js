import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

/**
 * 格式化日期
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return date ? dayjs(date).format(format) : '-'
}

/**
 * 相对时间
 */
export function fromNow(date) {
  return date ? dayjs(date).fromNow() : '-'
}

/**
 * 格式化授权类型
 */
export function formatLicenseType(type) {
  const map = {
    permanent: '永久授权',
    temporary: '临时授权',
    trial: '试用授权'
  }
  return map[type] || type
}

/**
 * 格式化状态
 */
export function formatStatus(status) {
  const map = {
    active: '正常',
    disabled: '已禁用',
    expired: '已过期'
  }
  return map[status] || status
}

/**
 * 格式化角色
 */
export function formatRole(role) {
  const map = {
    super_admin: '超级管理员',
    admin: '管理员',
    viewer: '查看者'
  }
  return map[role] || role
}

/**
 * 获取状态标签类型
 */
export function getStatusType(status) {
  const map = {
    active: 'success',
    disabled: 'danger',
    expired: 'info'
  }
  return map[status] || 'info'
}

/**
 * 获取剩余天数状态
 */
export function getRemainingDaysType(days) {
  if (days < 0) return 'danger'
  if (days <= 7) return 'warning'
  if (days <= 30) return 'primary'
  return 'success'
}

/**
 * 复制到剪贴板
 */
export function copyToClipboard(text) {
  // 优先使用现代API
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }

  // 降级方案：使用传统的 execCommand
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        resolve()
      } else {
        reject(new Error('复制失败'))
      }
    } catch (err) {
      document.body.removeChild(textArea)
      reject(err)
    }
  })
}

/**
 * 下载文件
 */
export function downloadFile(data, filename, type = 'application/json') {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 导出JSON为Excel
 */
export function exportToExcel(data, filename = 'export.xlsx') {
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, filename)
  })
}
