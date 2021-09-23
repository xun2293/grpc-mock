<template>
    <div class="login" clearfix>
        <div class="login-wrapper">
            <el-row type="flex" justify="center">
                <el-form
                        ref="form"
                        :model="form"
                        :rules="rules"
                        status-icon
                        label-width="80px">
                    <h3 class="login-title">登录</h3>
                    <el-form-item prop="username" label="用户名">
                        <el-input v-model="form.username" autocomplete="off" placeholder="请输入用户名" prefix-icon></el-input>
                    </el-form-item>
                    <el-form-item id="password" prop="password" label="密码">
                        <el-input v-model="form.password" autocomplete="off" show-password placeholder="请输入密码"></el-input>
                    </el-form-item>

                </el-form>

            </el-row>
            <div class="login-center">
                <el-button type="primary" @click="onSubmit('form')">登 录</el-button>
            </div>
            <div class="login-center">
                <router-link style="" to="/register">注册账号</router-link>
            </div>
        </div>
    </div>

</template>

<script>
  import { mapMutations } from 'vuex'


  export default {
    name: "Login",
    data() {
      let checkUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        } else {
          callback();
        }
      };
      let checkPassword = (rule, value, callback) => {
        if (value === '') {
          callback(new Error("请输入密码"));
        } else if (value.length < 6) {
          callback(new Error("密码长度错误"));
        } else {
          callback();
        }
      };
      return {
        form: {
          username: '',
          password: ''
        },
        rules: {
          username: [{ validator: checkUsername, trigger: 'change' }],
          password: [{ validator: checkPassword, trigger: 'change' }],
        }
      }
    },
    methods: {
      ...mapMutations({
        bindLogin: 'BIND_LOGIN',
        saveUser: 'SAVE_USER'
      }),
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$axios.post('login', {username: this.form.username, password: this.form.password})
              .then(rsp => {
                let data = rsp.data;
                this.showMessage(data);
                if (data.code === 0) {
                  this.bindLogin(data.data.token);
                  this.saveUser(data.data.username);
                  this.$router.replace({path: '/'})
                }
              })
              .catch(error => {
                // handle error
                console.log(error);
              })
              .finally(function () {
                // always executed
              });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    }
  }
</script>

<style scoped>
    .login {
        width: 100%;
        height: 740px;
        background-color: #fff;
        background-size: cover;
        overflow: hidden;
    }
    .login-wrapper {
        background-color: #f4f4f4;
        width: 400px;
        height: 300px;
        margin: 215px auto;
        overflow: hidden;
        padding-top: 10px;
        line-height: 40px;
    }
    .login-title {
        color: #0babeab8;
        font-size: 24px;
        text-align: center;
    }
    .login-center {
        justify-content: center;
        display: flex;
    }
    a {
        text-decoration: none;
        color: #aaa;
        font-size: 15px;
    }
    a:hover {
        color: coral;
    }
</style>
