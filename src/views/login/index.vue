<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">
      <div class="left-container">
        <img src="./style/images/login-logo.png" class="logo-img">
        <span class="login-right">© 2020 中软国际</span>
      </div>
      <div class="right-container">
        <div class="title-container">
<!--          <lang-select class="set-language" />-->
        </div>

        <el-form-item prop="username">
          <span class="input-container">
            用户名
          </span>
          <el-input
              ref="username"
              v-model="loginForm.username"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="on"
          />
        </el-form-item>

        <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
          <el-form-item prop="password">
            <span class="input-container">
              密码
            </span>
            <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.native="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
        </el-tooltip>

        <el-button :loading="loading" type="primary" class="login-btn" @click.native.prevent="handleLogin">
          {{ $t('login.logIn') }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
// import LangSelect from '@/components/LangSelect'

export default {
  name: 'Login',
  // components: { LangSelect },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error('请输入用户名!'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error('请输入密码!'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
              .then(() => {
                this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
        } else {
          this.$message.error('用户名或密码不能为空!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>
<style lang="scss" scoped>
$bg:#fdfdfd url('./style/images/login-bg.png') no-repeat left center fixed;
$dark_gray:#889aa4;
$light_gray:#eee;
$cursor: #fff;
@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.login-container {
  min-height: 100%;
  width: 100%;
  background: $bg;
  overflow: hidden;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;

  .left-container {
    position: relative;
    float: left;
    width: 50%;
    .logo-img{
      margin: 155px 129px;
    }
    .login-right{
      opacity: 0.35;
      font-size: 12px;
      color: #FFFFFF;
      letter-spacing: 0.38px;
      line-height: 16px;
      margin-left: 170px;
    }
  }
  .right-container {
    position: relative;
    float: left;
    width: 50%;
    background: #fdfdfd;
    padding: 76px 70px;
  }
  .el-input {
    display: inline-block;
    height: 47px;
    width: 100%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: #454545;
  }
  .login-form {
    position: relative;
    width: 900px;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
    margin-top: 10%;
    background-color: #353A43!important;
    box-shadow: 0 29px 38px 0 rgba(53,58,67,0.26);
    border-radius: 5px;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .input-container {
    color: #889aa4;
    vertical-align: middle;
    display: inline-block;
    width: 100%;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    right: 10px;
    top: 37px;
    font-size: 16px;
    color: #889aa4;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: absolute;
  }
  .login-btn{
    width: 100%;
    margin-top: 20px;
    padding:13px 0px;
    background: #d70010!important;
    border-color: #d70010!important;
    color: #ffffff!important;
    font-weight: bold!important;
  }

  .login-btn:focus {
    background: #d70010!important;
    border-color: #d70010!important;
    color: #ffffff!important;
    font-weight: bold!important;
  }
  .login-btn:active {
    background: #ff0114!important;
    border-color: #ff0114!important;
    color: #ffffff!important;
    outline: none!important;
    font-weight: bold!important;
  }
}
</style>
