<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">
      <div class="left-container">
        <img src="./style/images/login-logo.png" class="logo-img" />
        <span class="login-right">© 2020 中软国际</span>
      </div>
      <div class="right-container">
        <el-form-item prop="username">
          <span class="input-container">用户名</span>
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
            <span class="input-container">密码</span>
            <el-input
              ref="password"
              v-model="loginForm.password"
              type="text"
              name="password"
              tabindex="2"
              autocomplete="on"
              @keyup.native="checkCapslock"
              @blur="capsTooltip = false"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>
        </el-tooltip>
        <el-button type="primary" class="login-btn" @click.native.prevent="handleLogin">登录</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  components: {},
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
      capsTooltip: false,
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
  },
  mounted() {
    // if (this.loginForm.username === '') {
    //   this.$refs.username.focus()
    // } else if (this.loginForm.password === '') {
    //   this.$refs.password.focus()
    // }
  },
  destroyed() {
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // this.$http({
          //   method: 'post',
          //   url: 'http://139.159.246.94:1088/base/login',
          // })
          this.$store.dispatch('user/login', this.loginForm)
          .then(function(res){
            console.log(res)
            // var json = res.data
            // console.log(json.data);
            // this.$Message.success('Success!');
            this.$store.commit('ADD_COUNT', json.data.token);
          }.bind(this)).catch(function(err){
            this.$Message.error('登录失败，错误：'+ err);
            this.$Loading.error();
          }.bind(this))
          // this.$store.dispatch('user/login', this.loginForm)
          //   .then(() => {
          //     this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
          //     this.loading = false
          //   })
          //   .catch(() => {
          //     this.loading = false
          //   })
          // alert(valid)
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

<style scoped>
  .login-container{
    height: 100%;
    width: 100%;
    background: #fdfdfd url(style/images/login-bg.png) no-repeat left center fixed;
    overflow: hidden;
  }
  .login-form{
    position: relative;
    width: 900px;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
    margin-top: 10%;
    background-color: #353a43 !important;
    box-shadow: 0 29px 38px 0 rgba(53,58,67,0.36);
    border-radius: 5px;
  }
  .left-container{
    position: relative;
    float: left;
    width: 50%;
  }
  .right-container{
    position: relative;
    float: left;
    width: 50%;
    background: #fdfdfd;
    padding: 84.56px 70px;
  }
  .logo-img {
    margin: 155px 129px;
  }
  .login-btn {
    width: 100%;
    margin-top: 20px;
    padding: 13px 0px;
    background: #d70010 !important;
    border-color: #d70010 !important;
    color: #fff !important;
    font-weight: bold !important;
  }
  .login-right {
    opacity: .35;
    font-size: 12px;
    color: #fff;
    letter-spacing: 0.38px;
    line-height: 16px;
    margin-left: 170px;
  }
</style>
