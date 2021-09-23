<template>
    <div id="app">
        <el-container v-if="isShowNav()">
            <el-aside width="200px">
                <Nav/>
            </el-aside>
            <el-container>
                <el-main>
                    <router-view></router-view>
                </el-main>
                <el-footer></el-footer>
            </el-container>
        </el-container>
        <el-container v-if="!isShowNav()">
            <router-view></router-view>
        </el-container>

    </div>
</template>

<script>
  import Nav from "./components/Nav.vue";

  export default {
    name: 'root',
    data() {
      return {

      };
    },
    components: {
      Nav
    },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      isShowNav() {
        return this.$route.name !== 'login' && this.$route.name !== 'register'
      }
    }
  }
</script>

<style>
    #app {
        width: 100%;
        height: 100%;
    }
    .el-menu {
        min-width: 1090px;
    }
</style>
