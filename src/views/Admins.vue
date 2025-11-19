<template>
  <div class="admins-bg">
    <div class="admins-container">
      <!-- 页面标题区域 -->
      <div class="page-header">
        <div class="header-content glass-card">
          <div class="title-icon">
            <el-icon :size="32" color="#409eff"><UserFilled /></el-icon>
          </div>
          <div class="title-info">
            <h1 class="page-title">管理员管理</h1>
            <p class="page-subtitle">管理系统管理员账户和权限</p>
          </div>
          <div class="header-actions">
            <el-tag type="info" size="large" class="count-tag">
              总计: {{ pagination.total }} 个管理员
            </el-tag>
            <el-button
              v-if="authStore.isSuperAdmin"
              type="primary"
              size="large"
              :icon="Plus"
              class="create-btn"
              @click="openCreateDialog"
            >
              <el-icon class="btn-icon"><Plus /></el-icon>
              创建管理员
            </el-button>
          </div>
        </div>
      </div>

    <!-- 表格区域 -->
      <div class="table-section">
        <div class="glass-card table-card">
          <div class="table-wrapper">
            <el-table
              v-loading="loading"
              :data="admins"
              stripe
              class="modern-table"
              style="width: 100%"
            >
              <el-table-column prop="username" label="用户名" min-width="150">
                <template #default="{ row }">
                  <div class="user-cell">
                    <div class="user-avatar">
                      <el-icon :size="16" color="#409eff"><User /></el-icon>
                    </div>
                    <span class="username">{{ row.username }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="email" label="邮箱" min-width="200">
                <template #default="{ row }">
                  <div class="email-cell">
                    <el-icon :size="14" color="#666"><Message /></el-icon>
                    <span>{{ row.email }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="role" label="角色" width="140">
                <template #default="{ row }">
                  <div class="role-cell">
                    <el-tag
                      :type="getRoleType(row.role)"
                      effect="light"
                      class="role-tag"
                    >
                      <el-icon class="role-icon"><component :is="getRoleIcon(row.role)" /></el-icon>
                      {{ getRoleText(row.role) }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
                    <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                  <div class="status-cell">
                    <el-switch
                      v-model="row.status"
                      active-value="active"
                      inactive-value="disabled"
                      :disabled="row.id === authStore.admin.id"
                      @change="updateStatus(row)"
                      class="status-switch"
                    />
                    <span class="status-text" :class="row.status">{{ row.status === 'active' ? '启用' : '禁用' }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="last_login" label="最后登录" width="160">
                <template #default="{ row }">
                  <div class="time-cell">
                    <el-icon :size="14" color="#666"><Clock /></el-icon>
                    <span>{{ row.last_login ? formatDate(row.last_login) : '从未登录' }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="160">
                <template #default="{ row }">
                  <div class="time-cell">
                    <el-icon :size="14" color="#666"><Calendar /></el-icon>
                    <span>{{ formatDate(row.created_at) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <div class="actions-cell">
                    <el-button
                      type="primary"
                      :icon="Edit"
                      size="small"
                      class="action-btn"
                      @click="openEditDialog(row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="warning"
                      :icon="Key"
                      size="small"
                      class="action-btn"
                      @click="openPasswordDialog(row)"
                    >
                      密码
                    </el-button>
                    <el-button
                      v-if="row.id !== authStore.admin.id"
                      type="danger"
                      :icon="Delete"
                      size="small"
                      class="action-btn danger"
                      @click="handleDelete(row)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 分页区域 -->
        <div class="pagination-wrapper">
          <div class="glass-card pagination-card">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchAdmins"
              @current-change="fetchAdmins"
              class="modern-pagination"
            />
          </div>
        </div>
      </div>

    <!-- Create Dialog -->
    <el-dialog
      v-model="createVisible"
      title="创建管理员"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="createForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="editVisible"
      title="编辑管理员"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="editForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleEdit">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- Change Password Dialog -->
    <el-dialog
      v-model="passwordVisible"
      title="修改密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="passwordForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleChangePassword">
          确定
        </el-button>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Key, UserFilled, User, Message, Star, User as UserIcon, View, Clock, Calendar } from '@element-plus/icons-vue';
import { getAdmins, createAdmin, updateAdmin, updateAdminPassword, deleteAdmin } from '../api';
import { formatDate } from '../utils';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const loading = ref(false);
const submitting = ref(false);
const admins = ref([]);
const createVisible = ref(false);
const editVisible = ref(false);
const passwordVisible = ref(false);
const createFormRef = ref(null);
const editFormRef = ref(null);
const passwordFormRef = ref(null);

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

const createForm = reactive({
  username: '',
  password: '',
  email: '',
  role: 'admin',
  notes: '',
});

const editForm = reactive({
  id: null,
  username: '',
  email: '',
  role: '',
  status: 'active',
  notes: '',
});

const passwordForm = reactive({
  id: null,
  username: '',
  password: '',
  confirmPassword: '',
});

const createRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
};

const editRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
};

const passwordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.password) {
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

const getRoleIcon = (role) => {
  const icons = {
    super_admin: Star,
    admin: UserIcon,
    viewer: View,
  };
  return icons[role] || UserIcon;
};

const fetchAdmins = async () => {
  loading.value = true;
  try {
    const response = await getAdmins({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    admins.value = response;
    pagination.total = response.length;
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取管理员列表失败');
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  Object.assign(createForm, {
    username: '',
    password: '',
    email: '',
    role: 'admin',
    notes: '',
  });
  createVisible.value = true;
};

const handleCreate = async () => {
  try {
    await createFormRef.value.validate();
    submitting.value = true;
    await createAdmin(createForm);
    ElMessage.success('管理员创建成功');
    createVisible.value = false;
    fetchAdmins();
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response?.data?.message || '创建管理员失败');
    }
  } finally {
    submitting.value = false;
  }
};

const openEditDialog = (admin) => {
  Object.assign(editForm, {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    notes: admin.notes || '',
  });
  editVisible.value = true;
};

const handleEdit = async () => {
  try {
    await editFormRef.value.validate();
    submitting.value = true;
    await updateAdmin(editForm.id, {
      email: editForm.email,
      role: editForm.role,
      status: editForm.status,
      notes: editForm.notes,
    });
    ElMessage.success('管理员信息更新成功');
    editVisible.value = false;
    fetchAdmins();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '更新管理员失败');
  } finally {
    submitting.value = false;
  }
};

const updateStatus = async (admin) => {
  try {
    await updateAdmin(admin.id, { status: admin.status });
    ElMessage.success('状态更新成功');
    fetchAdmins();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '更新状态失败');
    fetchAdmins();
  }
};

const openPasswordDialog = (admin) => {
  Object.assign(passwordForm, {
    id: admin.id,
    username: admin.username,
    password: '',
    confirmPassword: '',
  });
  passwordVisible.value = true;
};

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value.validate();
    submitting.value = true;
    await updateAdminPassword(passwordForm.id, {
      password: passwordForm.password,
    });
    ElMessage.success('密码修改成功');
    passwordVisible.value = false;
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '修改密码失败');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (admin) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除管理员 "${admin.username}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await deleteAdmin(admin.id);
    ElMessage.success('管理员删除成功');
    fetchAdmins();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除管理员失败');
    }
  }
};

onMounted(() => {
  if (!authStore.isSuperAdmin) {
    ElMessage.error('您没有权限访问此页面');
    return;
  }
  fetchAdmins();
});
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables.scss';

.admins-bg {
  min-height: 100vh;
  background: $bg-secondary;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -15%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(64, 158, 255, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 18s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -25%;
    left: -5%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(41, 182, 246, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 15s ease-in-out infinite reverse;
  }
}

.admins-container {
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
    gap: 24px;
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
      flex-shrink: 0;
    }

    .title-info {
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
        font-weight: 500;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;

      .count-tag {
        background: rgba(64, 158, 255, 0.1);
        border: 1px solid rgba(64, 158, 255, 0.2);
        color: #409eff;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 20px;
      }

      .create-btn {
        height: 48px;
        padding: 0 24px;
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
  }
}

.table-section {
  .table-card {
    padding: 24px;
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

    .table-wrapper {
      overflow-x: auto;

      .modern-table {
        :deep(.el-table__header-wrapper) {
          .el-table__header {
            th {
              background: rgba(64, 158, 255, 0.05);
              color: #333;
              font-weight: 600;
              font-size: 14px;
              border-bottom: 2px solid rgba(64, 158, 255, 0.1);

              .cell {
                padding: 16px 12px;
              }
            }
          }
        }

        :deep(.el-table__body-wrapper) {
          .el-table__body {
            tr {
              transition: $transition-quick;

              &:hover {
                background: rgba(64, 158, 255, 0.03);
              }

              td {
                border-bottom: 1px solid rgba(64, 158, 255, 0.08);
                padding: 16px 12px;

                .cell {
                  padding: 0;
                }
              }
            }
          }
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;

          .user-avatar {
            width: 32px;
            height: 32px;
            background: rgba(64, 158, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .username {
            font-weight: 500;
            color: #333;
          }
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;

          .el-icon {
            flex-shrink: 0;
          }
        }

        .role-cell {
          .role-tag {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 12px;
            font-weight: 500;
            font-size: 13px;

            .role-icon {
              font-size: 14px;
            }
          }
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 8px;

          .status-switch {
            :deep(.el-switch__core) {
              border-radius: 12px;
            }
          }

          .status-text {
            font-size: 13px;
            font-weight: 500;

            &.active {
              color: #67c23a;
            }

            &.disabled {
              color: #f56c6c;
            }
          }
        }

        .time-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;

          .el-icon {
            flex-shrink: 0;
          }
        }

        .actions-cell {
          display: flex;
          gap: 8px;

          .action-btn {
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            transition: $transition-quick;

            &:hover {
              transform: translateY(-1px);
            }

            &.danger:hover {
              background: #f78989;
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: center;

    .pagination-card {
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(245, 249, 255, 0.8);
      box-shadow: $shadow-soft;
      border-radius: 16px;
      display: inline-block;

      .modern-pagination {
        :deep(.el-pagination) {
          .el-pager li {
            border-radius: 8px;
            margin: 0 2px;
            font-weight: 500;

            &.is-active {
              background: linear-gradient(135deg, #409eff 0%, #29b6f6 100%);
              color: white;
            }
          }

          .btn-prev,
          .btn-next {
            border-radius: 8px;
            margin: 0 2px;
          }

          .el-select .el-input .el-input__inner {
            border-radius: 8px;
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
  .admins-container {
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

      .header-actions {
        flex-direction: column;
        width: 100%;
        gap: 12px;

        .create-btn {
          width: 100%;
        }
      }
    }

    .table-section {
      .table-card {
        padding: 16px;

        .table-wrapper {
          .modern-table {
            font-size: 12px;

            :deep(.el-table__body-wrapper) {
              .el-table__body {
                td {
                  padding: 12px 8px;
                }
              }
            }

            .user-cell {
              gap: 8px;

              .user-avatar {
                width: 28px;
                height: 28px;
              }
            }

            .actions-cell {
              flex-direction: column;
              gap: 4px;

              .action-btn {
                font-size: 12px;
                padding: 6px 8px;
              }
            }
          }
        }
      }

      .pagination-wrapper {
        .pagination-card {
          padding: 16px;

          .modern-pagination {
            :deep(.el-pagination) {
              .el-pager li,
              .btn-prev,
              .btn-next {
                min-width: 32px;
                height: 32px;
                line-height: 30px;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}

// 深色模式支持
html.dark {
  .admins-bg {
    background: $bg-secondary;
  }

  .page-header .header-content {
    background: rgba(45, 45, 45, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .table-section {
    .table-card {
      background: rgba(45, 45, 45, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .table-wrapper {
        .modern-table {
          :deep(.el-table__header-wrapper) {
            .el-table__header {
              th {
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
                border-bottom-color: rgba(255, 255, 255, 0.1);
              }
            }
          }

          :deep(.el-table__body-wrapper) {
            .el-table__body {
              tr {
                &:hover {
                  background: rgba(255, 255, 255, 0.03);
                }

                td {
                  border-bottom-color: rgba(255, 255, 255, 0.1);
                }
              }
            }
          }

          .user-cell .username {
            color: #fff;
          }

          .email-cell {
            color: #aaa;
          }

          .time-cell {
            color: #aaa;
          }
        }
      }
    }

    .pagination-wrapper .pagination-card {
      background: rgba(45, 45, 45, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
