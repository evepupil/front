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
            <el-button type="danger" @click="resetPassword">重置密码</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="warning" @click="logout">注销</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'; // 引入 Element Plus 组件

export default {
  name: 'UserProfile',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
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
    async resetPassword() {
      try {
        const response = await http.post('/user/reset-password');
        if (response.data.code === 0) {
          ElMessage.success('密码重置成功，请检查您的邮箱');
        } else {
          ElMessage.error(`重置失败: ${response.data.message}`);
        }
      } catch (error) {
        ElMessage.error(`重置失败: ${error.message}`);
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