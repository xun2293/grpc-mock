<template>
    <el-menu
            :default-active="activeNav"
            class="el-menu-vertical-demo"
            router>
        <span style="color: #67c23a;margin-left: 25px;">欢迎，{{ username }}</span>

        <el-menu-item index="/">
            <i class="el-icon-menu"></i>
            <span slot="title">文件管理</span>
        </el-menu-item>

        <el-menu-item index="/codegen">
            <i class="el-icon-menu"></i>
            <span slot="title">代码生成</span>
        </el-menu-item>
        <el-menu-item index="/home">
            <i class="el-icon-menu"></i>
            <span slot="title">Mock Server</span>
        </el-menu-item>
        <el-menu-item index="/add">
            <i class="el-icon-menu"></i>
            <span slot="title">Mock Add</span>
        </el-menu-item>
    </el-menu>
</template>

<script>
  import modules from "../store/modules";
  export default {
    name: "Nav",
    data() {
      return {
        activeNav: '/',
        username: modules.user.state.username
      }
    },
    methods: {

    },
    mounted() {
      let href = window.location.href;
      this.activeNav = href.slice(href.lastIndexOf('/'), href.length);
    }
  }
</script>

<style scoped>

</style>
