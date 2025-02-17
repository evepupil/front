import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import ElementPlus from 'element-plus'; // 引入 Element Plus
import 'element-plus/dist/index.css'; // 引入 Element Plus 样式

// 设置 Axios 基础 URL
axios.defaults.baseURL = 'http://localhost:5000'; // 确保这里是后端服务的实际端口

// 添加请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // 从 localStorage 获取 token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // 设置 Authorization 头
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const app = createApp(App);

// 将 Axios 添加到 Vue 原型
app.config.globalProperties.$http = axios;

// 使用 Element Plus
app.use(ElementPlus);

// 使用 Vue Router
app.use(router);

// 挂载应用
app.mount('#app');