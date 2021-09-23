// axios 配置
import axios from 'axios'
import store from './store'
import router from './router'
import modules from "./store/modules";

//创建 axios 实例
let instance = axios.create({
  timeout: 5000, // 请求超过5秒即超时返回错误
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
});

instance.defaults.baseURL = process.env.VUE_APP_SERVER_URL;
instance.interceptors.request.use(
  config => {
    let token = modules.user.state.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config
  },
  err => {
    return Promise.reject(err)
  });

// http response 拦截器
instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 返回 401 (未授权) 清除 token 并跳转到登录页面
          store.commit('BIND_LOGOUT');
          router.replace({
            path: '/login',
            query: {
              redirect: router.currentRoute.fullPath
            }
          });
          break;
        default:
          this.showMessage('系统错误，请稍后重试!');
      }
    }
    return Promise.reject(error.response) // 返回接口返回的错误信息
  }
);

export default instance
