<template>
  <el-container class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2>在线购药商城</h2>
      </div>
      <el-form @submit.prevent="login" :model="form" label-width="80px" class="login-form">
        <el-form-item label="用户名" :error="usernameError">
          <el-input v-model="form.username" placeholder="请输入用户名" maxlength="20">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
        </el-form-item>
        <el-form-item label="密码" :error="passwordError">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" maxlength="20">
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="form.userType" class="user-type-select">
            <el-option label="用户" value="user"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" @click="login" :loading="loading">登录</el-button>
          <router-link to="/register">
            <el-button type="default">注册</el-button>
          </router-link>
        </el-form-item>
      </el-form>
    </div>
  </el-container>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

export default {
  name: 'User_Login',
  components: {
    User,
    Lock
  },
  data() {
    return {
      form: {
        username: '',
        password: '',
        userType: 'user',
      },
      usernameError: '',
      passwordError: '',
      loading: false,
    };
  },
  methods: {
    async login() {
      this.usernameError = this.form.username ? '' : '用户名不能为空';
      this.passwordError = this.form.password ? '' : '密码不能为空';

      if (this.usernameError || this.passwordError) {
        return;
      }

      try {
        const response = await axios.post('/login', {
          username: this.form.username,
          password: this.form.password,
          is_admin: this.form.userType === 'admin' ? 1 : 0, // 根据用户类型设置 is_admin
        });

        if (response.data.code === 0) {
          // 登录成功，保存 token
          localStorage.setItem('token', response.data.token);
          const isAdmin = response.data.user.is_admin; // 获取用户角色信息
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
          this.$router.push('/'); // 
          ElMessage.success('登录成功！');
        } else {
          ElMessage.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('登录失败，请重试。'); 
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  background-image: url('@/assets/login_background.jpg');
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.login-header h2 {
  color: #2c3e50;
  font-size: 24px;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-input__wrapper) {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-form :deep(.el-input__inner) {
  height: 40px;
}

.user-type-select {
  width: 100%;
}

.button-group {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}

.button-group .el-button {
  width: 100px;
  height: 40px;
  border-radius: 8px;
  font-size: 16px;
}

.error-message {
  margin-top: 5px;
  color: #f56c6c;
  font-size: 12px;
}
</style>
