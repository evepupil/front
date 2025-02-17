import axios from 'axios';
import { ElMessage } from 'element-plus'; // 引入 Element Plus 的消息提示

const http = axios.create({
  baseURL: 'http://localhost:5000', // 替换为您的 API 基础 URL
  timeout: 10000, // 请求超时时间
});

// 添加请求拦截器
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // 从 localStorage 获取 token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // 设置 Authorization 头
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 添加响应拦截器
http.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        ElMessage.error('未登录，请先登录'); // 显示未登录提示
        // 跳转到登录页面
        window.location.href = '/login'; // 替换为您的登录页面路径
      }
    }
    return Promise.reject(error);
  }
);

export default http; 