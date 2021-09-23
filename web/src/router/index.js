import Vue from 'vue'
import Router from 'vue-router'

import store from '../store/index'
import Home from '../components/Home.vue'
import Add from '../components/Add.vue'
import File from '../components/File.vue'
import CodeGen from '../components/CodeGen.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

Vue.use(Router);
let username = localStorage.getItem('username');
let token = localStorage.getItem('token');
if (username) {
  store.commit('SAVE_USER', username)
}
if (token) {
  store.commit('BIND_LOGIN', token)
}

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/add',
      name: 'add',
      component: Add
    },
    {
      path: '/',
      name: 'file',
      component: File
    },
    {
      path: '/codegen',
      name: 'codegen',
      component: CodeGen
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      isNav: false
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
  ]
})
