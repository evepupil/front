import axios from 'axios';
import { ElMessage } from 'element-plus';

const http = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000, 
});

// 请求拦截器
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; 
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
http.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        ElMessage.error('未登录，请先登录'); 
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default http; 