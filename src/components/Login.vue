<template>
  <el-container class="login-container">
    <el-form @submit.prevent="login" :model="form" label-width="100px" class="login-form">
      <el-form-item label="用户名" :error="usernameError">
        <el-input v-model="form.username" placeholder="请输入用户名" maxlength="20" />
        <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
      </el-form-item>
      <el-form-item label="密码" :error="passwordError">
        <el-input type="password" v-model="form.password" placeholder="请输入密码" maxlength="20" />
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
      </el-form-item>
      <el-form-item label="用户类型">
        <el-select v-model="form.userType">
          <el-option label="用户" value="user"></el-option>
          <el-option label="管理员" value="admin"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登录</el-button>
        <router-link to="/register">
          <el-button type="default">注册</el-button>
        </router-link>
      </el-form-item>
    </el-form>
  </el-container>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus'; // 引入 ElMessage

export default {
  name: 'User_Login',
  data() {
    return {
      form: {
        username: '',
        password: '',
        userType: 'user', // 默认用户类型为用户
      },
      usernameError: '',
      passwordError: '',
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
          localStorage.setItem('token', response.data.token); // 假设 token 在响应中返回
          const isAdmin = response.data.user.is_admin; // 获取用户角色信息
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
          this.$router.push('/'); // 假设跳转到主页
          ElMessage.success('登录成功！');
        } else {
          ElMessage.error(response.data.message); // 使用 ElMessage 显示错误消息
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('登录失败，请重试。'); // 使用 ElMessage 显示错误消息
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  background-image: url('@/assets/login_background.jpg'); /* 使用 login_background.jpg 作为背景图片 */
  background-size: cover; /* 背景图片覆盖整个容器 */
  background-position: center; /* 背景图片居中 */
  background-repeat: no-repeat; /* 不重复背景图片 */
  height: 100vh; /* 使容器高度为视口高度 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.login-form {
  background-color: rgba(255, 255, 255, 0.8); /* 半透明白色背景 */
  padding: 20px;
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 阴影效果 */
  width: 300px; /* 设置宽度 */
}

.error-message {
  margin-top: 10px; /* 提示与按钮之间的间距 */
  color: red; /* 错误消息颜色 */
  font-weight: bold; /* 加粗 */
  text-align: center; /* 居中对齐 */
}
</style>
