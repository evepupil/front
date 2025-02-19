<template>
  <div class="user-profile">
    <h2>个人中心</h2>
    <el-card>
      <div class="user-info">
        <el-form :model="user" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="user.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="user.email"></el-input>
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="user.phone"></el-input>
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="user.address"></el-input>
          </el-form-item>
          <el-form-item label="用户类型">
            <el-input :value="user.isAdmin ? '管理员' : '普通用户'" disabled></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateProfile">保存修改</el-button>
            <el-button type="danger" @click="openResetPasswordDialog">重置密码</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="warning" @click="logout">注销</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-dialog title="重置密码" v-model="resetPasswordDialogVisible">
      <el-form :model="resetPasswordForm">
        <el-form-item label="原密码" :rules="[{ required: true, message: '请输入原密码', trigger: 'blur' }]">
          <el-input type="password" v-model="resetPasswordForm.oldPassword" placeholder="请输入原密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" :rules="[{ required: true, message: '请输入新密码', trigger: 'blur' }]">
          <el-input type="password" v-model="resetPasswordForm.newPassword" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" :rules="[{ required: true, message: '请确认新密码', trigger: 'blur' }]">
          <el-input type="password" v-model="resetPasswordForm.confirmPassword" placeholder="请确认新密码"></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="resetPasswordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="resetPassword">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElDialog } from 'element-plus'; // 引入 Element Plus 组件

export default {
  name: 'UserProfile',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElDialog,
  },
  data() {
    return {
      user: {
        username: '',
        email: '',
        phone: '',
        address: '',
        created_at: '',
        isAdmin: false,
      },
      resetPasswordDialogVisible: false, // 控制重置密码对话框的显示
      resetPasswordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    };
  },
  async created() {
    await this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await http.get('/user/profile');
        if (response.data.code === 0) {
          this.user = {
            username: response.data.user.username,
            email: response.data.user.email,
            phone: response.data.user.phone,
            address: response.data.user.address,
            created_at: new Date(response.data.user.created_at).toLocaleString(),
            isAdmin: response.data.user.isAdmin,
          };
        } else {
          console.error('获取用户信息失败:', response.data.message);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    async updateProfile() {
      try {
        const response = await http.put('/user/profile', {
          email: this.user.email,
          phone: this.user.phone,
          address: this.user.address,
        });
        if (response.data.code === 0) {
          ElMessage.success('用户信息更新成功');
        } else {
          ElMessage.error(`更新失败: ${response.data.message}`);
        }
      } catch (error) {
        ElMessage.error(`更新失败: ${error.message}`);
      }
    },
    openResetPasswordDialog() {
      this.resetPasswordDialogVisible = true; // 打开对话框
    },
    async resetPassword() {
      // 验证新密码和确认密码是否一致
      if (this.resetPasswordForm.newPassword !== this.resetPasswordForm.confirmPassword) {
        ElMessage.error('新密码和确认密码不一致');
        return;
      }

      try {
        const response = await http.post('/user/reset-password', {
          old_password: this.resetPasswordForm.oldPassword,
          new_password: this.resetPasswordForm.newPassword,
        });

        if (response.data.code === 0) {
          ElMessage.success('密码重置成功');
          this.resetPasswordDialogVisible = false; // 关闭对话框
          this.resetPasswordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }; // 重置表单
        } else {
          ElMessage.error(response.data.message);
        }
      } catch (error) {
        ElMessage.error('重置密码失败');
      }
    },
    logout() {
      localStorage.removeItem('token'); // 清除 token
      ElMessage.success('注销成功');
      this.$router.push('/login'); // 跳转到登录页面
    },
  },
};
</script>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.user-info {
  font-size: 16px;
  line-height: 1.5;
}
</style> 