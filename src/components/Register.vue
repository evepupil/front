<template>
  <el-container class="register-container">
    <el-form @submit.prevent="register" :model="form" label-width="100px" class="register-form">
      <el-form-item label="用户名" :error="usernameError">
        <el-input v-model="form.username" maxlength="20" placeholder="请输入用户名" />
        <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
      </el-form-item>
      <el-form-item label="密码" :error="passwordError">
        <el-input type="password" v-model="form.password" maxlength="20" placeholder="请输入密码" />
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
      </el-form-item>
      <el-form-item label="邮箱" :error="emailError">
        <el-input type="email" v-model="form.email" placeholder="请输入邮箱" @input="validateEmail" />
      </el-form-item>
      <el-form-item label="用户类型">
        <el-select v-model="form.userType">
          <el-option label="用户" value="user"></el-option>
          <el-option label="管理员" value="admin"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="register">注册</el-button>
        <router-link to="/login">
          <el-button type="default">返回登录</el-button>
        </router-link>
      </el-form-item>
    </el-form>
  </el-container>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'User_Register',
  data() {
    return {
      form: {
        username: '',
        password: '',
        email: '',
        userType: 'user', // 默认用户类型为用户
      },
      successMessage: '',
      errorMessage: '',
      usernameError: '',
      passwordError: '',
      emailError: '',
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = this.form.email && !emailPattern.test(this.form.email) ? '请输入有效的邮箱地址' : '';
    },
    async register() {
      this.usernameError = this.form.username.length > 20 ? '用户名不能超过20个字符' : '';
      this.passwordError = this.form.password.length > 20 ? '密码不能超过20个字符' : '';

      if (this.usernameError || this.passwordError || this.emailError) {
        return;
      }

      try {
        const isAdmin = this.form.userType === 'admin' ? 1 : 0;
        const response = await axios.post('/register', {
          username: this.form.username,
          password: this.form.password,
          email: this.form.email,
          is_admin: isAdmin,
        });

        if (response.data.code === 0) {
          this.successMessage = '注册成功！即将跳转到登录页面...';
          ElMessage.error(this.successMessage);
          setTimeout(() => {
            this.$router.push('/login');
          }, 3000);
        } else if (response.data.code === 1) {
          this.errorMessage = '用户已存在，请重新注册。';
          ElMessage.error(this.errorMessage);
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = '注册失败，请重试。';
        ElMessage.error(this.errorMessage);
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  background-image: url('@/assets/login_background.jpg'); /* 使用 login_background.jpg 作为背景图片 */
  background-size: cover; /* 背景图片覆盖整个容器 */
  background-position: center; /* 背景图片居中 */
  background-repeat: no-repeat; /* 不重复背景图片 */
  height: 100vh; /* 使容器高度为视口高度 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.register-form {
  background-color: rgba(255, 255, 255, 0.8); /* 半透明白色背景 */
  padding: 20px;
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 阴影效果 */
  width: 300px; /* 设置宽度 */
}

.success-message {
  margin-top: 20px;
  color: green; /* 成功消息的颜色 */
  font-weight: bold; /* 加粗 */
}

.error-message {
  margin-top: 10px; /* 提示与按钮之间的间距 */
  color: red; /* 错误消息颜色 */
  font-weight: bold; /* 加粗 */
  text-align: center; /* 居中对齐 */
}
</style>
