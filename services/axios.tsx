
import axios from 'axios';
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: false,
});

/* 请求拦截器 */
http.interceptors.request.use(config => {
  const token = localStorage.getItem('Token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* 响应拦截器 */
http.interceptors.response.use(
  response => response.data as any,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/adminlogin';
    }
    return Promise.reject(error);
  }
);

export default http;
