import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import 'jsoneditor/dist/jsoneditor.min.css'
import 'jsoneditor/dist/jsoneditor.min.js'

Vue.config.productionTip = false;

Vue.use(ElementUI);

Vue.prototype.showMessage = function (data) {
  if (data.hasOwnProperty('code')) {
    if (data.code === 0) {
      this.$message.success(data.msg);
    } else {
      this.$message.error(data.msg);
    }
  } else {
    this.$message.info(JSON.stringify(data));
  }
};

Vue.prototype.showError = function (error) {
  this.$message.error(JSON.stringify(error));
};

import axios from './axios';
// axios.defaults.baseURL = process.env.VUE_APP_SERVER_URL;
Vue.prototype.$axios = axios;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
