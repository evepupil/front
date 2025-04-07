<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>
    <el-card class="user-table-card">
      <el-table 
        :data="users" 
        style="width: 100%"
        :header-cell-style="{background:'#f5f7fa'}"
        border>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="is_admin" label="用户类型" :formatter="formatUserType" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template v-slot="scope">
            <el-button @click="openEditDialog(scope.row)" type="primary" size="small" plain>
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button @click="deleteUser(scope.row.id)" type="danger" size="small" plain>
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      title="编辑用户信息" 
      v-model="editDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form 
        :model="editUser" 
        label-width="80px"
        class="edit-form"
      >
        <el-form-item label="用户名">
          <el-input 
            v-model="editUser.username" 
            disabled
            placeholder="用户名不可修改"
          ></el-input>
        </el-form-item>
        <el-form-item 
          label="邮箱" 
          :class="{ 'is-error': emailError }"
        >
          <el-input 
            v-model="editUser.email" 
            @blur="validateEmail"
            placeholder="请输入邮箱地址"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
          <div v-if="emailError" class="error-message">{{ emailError }}</div>
        </el-form-item>
        <el-form-item 
          label="电话" 
          :class="{ 'is-error': phoneError }"
        >
          <el-input 
            v-model="editUser.phone" 
            @blur="validatePhone"
            placeholder="请输入电话号码"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
          <div v-if="phoneError" class="error-message">{{ phoneError }}</div>
        </el-form-item>
        <el-form-item label="地址">
          <el-input 
            v-model="editUser.address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-tag :type="editUser.is_admin ? 'danger' : 'success'">
            {{ editUser.is_admin ? '管理员' : '普通用户' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false" plain>取 消</el-button>
          <el-button type="primary" @click="updateUserProfile">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import http from '@/http';
import { ElMessage } from 'element-plus';
import { Edit, Delete, Message, Phone } from '@element-plus/icons-vue';

export default {
  name: 'UserManagement',
  components: {
    Edit,
    Delete,
    Message,
    Phone
  },
  data() {
    return {
      users: [], // 存储用户列表
      editUser: {
        username: '',
        email: '',
        phone: '',
        address: '',
        is_admin: false,
      },
      editDialogVisible: false, // 控制编辑对话框的显示
      emailError: '', // 邮箱错误信息
      phoneError: '', // 电话错误信息
    };
  },
  async created() {
    await this.fetchUsers(); // 获取用户列表
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await http.get('/users'); // 从后端获取用户列表
        if (response.data.code === 0) {
          this.users = response.data.users; // 更新用户列表
        } else {
          ElMessage.error('获取用户列表失败');
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
      }
    },
    openEditDialog(user) {
      this.editUser = { ...user }; // 复制用户信息到编辑对象
      this.editDialogVisible = true; // 打开编辑对话框
      this.emailError = ''; // 清空错误信息
      this.phoneError = ''; // 清空错误信息
    },
    async updateUserProfile() {
      if (this.validateEmail() && this.validatePhone()) {
        try {
          const response = await http.put(`/users/${this.editUser.id}`, this.editUser); 
          if (response.data.code === 0) {
            ElMessage.success('用户信息更新成功');
            this.editDialogVisible = false; // 关闭对话框
            await this.fetchUsers(); // 重新获取用户列表
          } else {
            ElMessage.error('更新用户信息失败');
          }
        } catch (error) {
          console.error('更新用户信息失败:', error);
          ElMessage.error('更新用户信息失败');
        }
      }
    },
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 简单的邮箱正则表达式
      if (!emailPattern.test(this.editUser.email)) {
        this.emailError = '请输入有效的邮箱地址';
        return false;
      }
      this.emailError = ''; // 清空错误信息
      return true;
    },
    validatePhone() {
      // 允许电话为空
      if (this.editUser.phone === '') {
        this.phoneError = ''; // 清空错误信息
        return true; // 允许为空
      }
      const phonePattern = /^\d{10}$/; // 假设电话号码为10位数字
      if (!phonePattern.test(this.editUser.phone)) {
        this.phoneError = '请输入有效的电话号码';
        return false;
      }
      this.phoneError = ''; // 清空错误信息
      return true;
    },
    formatUserType(row) {
      return row.is_admin ? '管理员' : '普通用户'; // 格式化用户类型
    },
    async deleteUser(userId) {
      try {
        const response = await http.delete(`/users/${userId}`); // 删除用户
        if (response.data.message === 'User deleted successfully!') {
          ElMessage.success('用户删除成功');
          this.fetchUsers(); // 刷新用户列表
        } else {
          ElMessage.error('删除用户失败');
        }
      } catch (error) {
        ElMessage.error('删除用户失败');
      }
    },
  },
};
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.user-table-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-button) {
  padding: 8px 15px;
}

:deep(.el-button [class*=el-icon]+span) {
  margin-left: 4px;
}

.edit-form {
  padding: 0 20px;
}

.dialog-footer {
  text-align: right;
  padding-top: 10px;
}

:deep(.el-tag) {
  font-size: 14px;
  padding: 4px 8px;
}

:deep(.el-input__prefix) {
  color: #909399;
}
</style>