<template>
  <el-container class="register-container">
    <div class="register-box">
      <div class="register-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2>用户注册</h2>
      </div>
      <el-form @submit.prevent="register" :model="form" label-width="100px" class="register-form">
        <el-form-item label="用户名" :error="usernameError">
          <el-input 
            v-model="form.username" 
            maxlength="20" 
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
          <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
        </el-form-item>
        <el-form-item label="密码" :error="passwordError">
          <el-input 
            type="password" 
            v-model="form.password" 
            maxlength="20" 
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </el-form-item>
        <el-form-item label="邮箱" :error="emailError">
          <el-input 
            type="email" 
            v-model="form.email" 
            placeholder="请输入邮箱" 
            @input="validateEmail"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
          <div v-if="emailError" class="error-message">{{ emailError }}</div>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="form.userType" class="user-type-select">
            <el-option label="用户" value="user"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" @click="register" class="submit-btn">注册</el-button>
          <router-link to="/login" class="login-link">
            <el-button type="default" class="submit-btn">返回登录</el-button>
          </router-link>
        </el-form-item>
      </el-form>
    </div>
  </el-container>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { User, Lock, Message } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

export default {
  name: 'User_Register',
  components: {
    ElIcon,
    User,
    Lock,
    Message
  },
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
  background-image: url('@/assets/login_background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
}

.register-box {
  position: relative;
  z-index: 1;
  width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.register-header h2 {
  color: #fff;
  font-size: 24px;
  margin: 0;
}

.register-form {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.el-form-item {
  margin-bottom: 25px;
}

.el-input {
  --el-input-hover-border-color: #409EFF;
  --el-input-focus-border-color: #409EFF;
}

.user-type-select {
  width: 100%;
}

.button-group {
  margin-top: 30px;
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  margin-bottom: 10px;
  height: 40px;
  font-size: 16px;
}

.login-link {
  display: block;
  width: 100%;
}

.success-message {
  margin-top: 20px;
  color: #67C23A;
  font-weight: 500;
}

.error-message {
  margin-top: 5px;
  color: #F56C6C;
  font-size: 12px;
  text-align: left;
}
</style>
