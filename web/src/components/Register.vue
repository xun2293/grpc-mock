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
                    <h3 class="login-title">注册</h3>
                    <el-form-item prop="username" label="用户名">
                        <el-input v-model="form.username" autocomplete="off" placeholder="请输入用户名" prefix-icon></el-input>
                    </el-form-item>
                    <el-form-item id="password" prop="password" label="密码">
                        <el-input v-model="form.password" autocomplete="off" show-password placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item id="passwordConfirm" prop="passwordConfirm" label="密码确认">
                        <el-input v-model="form.passwordConfirm" autocomplete="off" show-password placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item id="email" prop="email" label="邮箱">
                        <el-input v-model="form.email" autocomplete="off" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                </el-form>

            </el-row>
            <div class="login-center">
                <el-button type="primary" @click="onSubmit('form')">注 册</el-button>
            </div>
            <div class="login-center">
                <router-link style="" to="/login">登录</router-link>
            </div>
        </div>
    </div>

</template>

<script>
  export default {
    name: "Register",
    data() {
      let checkUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        } else if (!this.validatorUsername(value)) {
          callback(new Error('只能为英文或者数字'));
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
      let checkPasswordConfirm = (rule, value, callback) => {
        if (value === '') {
          callback(new Error("请输入密码"));
        } else if (value.length < 6) {
          callback(new Error("密码长度错误"));
        } else if (value !== this.form.password) {
          callback(new Error("密码不一致"));
        } else {
          callback();
        }
      };
      let checkEmail = (rule, value, callback) => {
        if (value === '') {
          callback(new Error("请输入邮箱"));
        } else if (!this.validatorEmail(value)) {
          callback(new Error("邮箱格式错误"));
        } else {
          callback();
        }
      };
      return {
        form: {
          username: '',
          password: '',
          passwordConfirm: '',
          email: ''
        },
        rules: {
          username: [{ validator: checkUsername, trigger: 'change' }],
          password: [{ validator: checkPassword, trigger: 'change' }],
          passwordConfirm: [{ validator: checkPasswordConfirm, trigger: 'change' }],
          email: [{ validator: checkEmail, trigger: 'change' }],
        }
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$axios.post('register', {
              username: this.form.username,
              password: this.form.password,
              passwordConfirm: this.form.passwordConfirm,
              email: this.form.email,
            })
              .then(rsp => {
                let data = rsp.data;
                this.showMessage(data);
                if (rsp.data.code === 0) {
                  this.$router.push({
                    path: '/login'
                  })
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
      },
      validatorEmail(str) {
        let re = /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;
        return re.test(str);
      },
      validatorUsername(str) {
        let re = /^[a-zA-Z0-9]*$/g;
        return re.test(str);
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
        height: 450px;
        margin: 100px auto;
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
