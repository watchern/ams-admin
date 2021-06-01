<template>
  <div class="login-outbox">
    <div class="login-container" v-if="skincontrol == 'old-login'">
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form skin-bgColor"
        autocomplete="on"
        label-position="left"
      >
        <div class="left-container">
          <img src="./style/images/login-logo.png" class="logo-img" />
          <!--        <span class="login-right">© 2020 中软国际</span>-->
        </div>
        <div class="right-container">
          <div class="title-container">
            <!--          <lang-select class="set-language" />-->
          </div>

          <el-form-item prop="username">
            <span class="input-container"> 用户名 </span>
            <el-input
              ref="username"
              v-model="loginForm.username"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="on"
            />
          </el-form-item>

          <el-tooltip
            v-model="capsTooltip"
            content="Caps lock is On"
            placement="right"
            manual
          >
            <el-form-item prop="password">
              <span class="input-container"> 密码 </span>
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
                <svg-icon
                  :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                />
              </span>
            </el-form-item>
          </el-tooltip>

          <el-button
            :loading="loading"
            type="primary"
            class="login-btn"
            @click.native.prevent="handleLogin"
          >
            {{ $t("login.logIn") }}
          </el-button>
        </div>
      </el-form>
    </div>
    <div
      v-else-if="skincontrol == 'new-login'"
      class="login-box2"
      :style="
        backgroundImg ? 'background-image:url(' + backgroundImg + ');' : ''
      "
    >
      <div class="login-box2center">
        <div class="login-box2left">
          <div class="login-box2-tit1">
            {{ title1 }}
          </div>
          <div class="login-box2-tit2">
            {{ title2 }}
          </div>
          <div class="login-box2-txt1">
            {{ text1 }}
          </div>
          <div class="login-box2-txt2">
            {{ text2 }}
          </div>
        </div>
        <div class="login-box2right">
          <el-form
            ref="loginFormNew"
            :model="loginForm"
            :rules="loginRules"
            class="loginbackcolor"
            autocomplete="on"
            label-position="left"
          >
            <div class="left-container">
              <div class="right-title">登 录</div>
              <!--        <span class="login-right">© 2020 中软国际</span>-->
            </div>
            <div class="right-container">
              <div class="title-container">
                <!--          <lang-select class="set-language" />-->
              </div>

              <el-form-item prop="username" class="login-item">
                <img src="@/assets/login_img/用户名.png" align="top" />
                <el-input
                  ref="usernamenew"
                  v-model="loginForm.username"
                  name="username"
                  type="text"
                  tabindex="1"
                  autocomplete="on"
                  class="login-input"
                />
              </el-form-item>

              <el-tooltip
                v-model="capsTooltip"
                content="Caps lock is On"
                placement="right"
                manual
              >
                <el-form-item prop="password" class="login-item">
                  <img src="@/assets/login_img/密码.png" align="top" />
                  <el-input
                    :key="passwordType"
                    ref="passwordnew"
                    v-model="loginForm.password"
                    :type="passwordType"
                    name="password"
                    tabindex="2"
                    autocomplete="on"
                    @keyup.native="checkCapslock"
                    @blur="capsTooltip = false"
                    @keyup.enter.native="handleLogin"
                    class="login-input"
                  />
                  <!-- <span class="show-pwd" @click="showPwd">
                    <svg-icon
                      :icon-class="
                        passwordType === 'password' ? 'eye' : 'eye-open'
                      "
                    />
                  </span> -->
                </el-form-item>
              </el-tooltip>

              <el-button
                :loading="loading"
                class="login-box2button"
                @click.native.prevent="handleLogin"
              >
                {{ $t("login.logIn") }}
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";
// import LangSelect from '@/components/LangSelect'
import { getUserRes } from "@/api/user";
export default {
  name: "Login",

  // components: { LangSelect },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error("请输入用户名!"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error("请输入密码!"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
      passwordType: "password",
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      skincontrol: "old-login",
      backgroundImg: "",
      title1: process.env.VUE_APP_BASE_SKINTITLE1 || "",
      title2: process.env.VUE_APP_BASE_SKINTITLE2 || "",
      text1: process.env.VUE_APP_BASE_SKINTEXT1 || "",
      text2: process.env.VUE_APP_BASE_SKINTEXT2 || "",
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        const query = route.query;
        console.log(query);
        if (query) {
          this.redirect = query.redirect;
          console.log(this.redirect);
          this.otherQuery = this.getOtherQuery(query);
        }
      },
      immediate: true,
    },
  },
  created() {
    this.skincontrol = process.env.hasOwnProperty("VUE_APP_BASE_SKINCONTROL")
      ? process.env["VUE_APP_BASE_SKINCONTROL"]
      : this.skincontrol;
    this.backgroundImg = process.env.hasOwnProperty(
      "VUE_APP_BASE_SKINBACKGROUND"
    )
      ? process.env["VUE_APP_BASE_SKINBACKGROUND"]
      : this.backgroundImg;
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === "") {
      if (this.skincontrol === "new-login") {
        this.$refs.usernamenew.focus();
      } else {
        this.$refs.username.focus();
      }
    } else if (this.loginForm.password === "") {
      if (this.skincontrol === "new-login") {
        this.$refs.passwordnew.focus();
      } else {
        this.$refs.password.focus();
      }
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e;
      this.capsTooltip = key && key.length === 1 && key >= "A" && key <= "Z";
    },
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      if (this.skincontrol == "new-login") {
        this.$refs.loginFormNew.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.$store
              .dispatch("user/login", this.loginForm)
              .then(() => {
                getUserRes().then((response) => {
                  response.data.application.forEach((app, index) => {
                    // 设置左侧应用栏数据
                    if (response.data.application[0].homepage) {
                      this.$router.push({
                        path: response.data.application[0].homepage || "/",
                        query: this.otherQuery,
                      });
                      this.loading = false;
                    } else {
                      this.$router.replace("/nopermission");
                      this.loading = false;
                    }
                  });
                });
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            this.$message.error("用户名或密码不能为空!");
            return false;
          }
        });
      } else {
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.$store
              .dispatch("user/login", this.loginForm)
              .then(() => {
                getUserRes().then((response) => {
                  response.data.application.forEach((app, index) => {
                    // 设置左侧应用栏数据
                    if (response.data.application[0].homepage) {
                      this.$router.push({
                        path: response.data.application[0].homepage || "/",
                        query: this.otherQuery,
                      });
                      this.loading = false;
                    } else {
                      this.$router.replace("/nopermission");
                      this.loading = false;
                    }
                  });
                });
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            this.$message.error("用户名或密码不能为空!");
            return false;
          }
        });
      }
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      }, {});
    },
  },
};
</script>
<style lang="scss" scoped>
$bg: #fdfdfd url("./style/images/login-bg.png") no-repeat left center fixed;
$dark_gray: #889aa4;
$light_gray: #eee;
$cursor: #fff;
@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
.login-outbox {
  height: 100%;
  width: 100%;
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
    .logo-img {
      margin: 155px 129px;
    }
    .login-right {
      opacity: 0.35;
      font-size: 12px;
      color: #ffffff;
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
    //background-color: #353A43!important;

    box-shadow: 0 29px 38px 0 rgba(53, 58, 67, 0.26);
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
  .login-btn {
    width: 100%;
    margin-top: 20px;
    padding: 13px 0px;
    background: #d70010;
    border-color: #d70010;
    color: #ffffff;
    font-weight: bold !important;
  }

  .login-btn:focus {
    background: #d70010;
    border-color: #d70010;
    color: #ffffff;
    font-weight: bold !important;
  }
  .login-btn:active {
    background: #ff0114;
    border-color: #ff0114;
    color: #ffffff;
    outline: none !important;
    font-weight: bold !important;
  }
}
</style>
<style lang="scss" scoped>
//new-login本地背景图在这里修改
$bg: #fdfdfd url("../../assets/login_img/背景.png") no-repeat left center fixed;
.login-box2 {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $bg;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  // filter: blur(2px);
  .login-box2center {
    height: 85%;
    width: 1500px;
    margin: 0 auto;
    margin-top: 13%;
    display: flex;
  }
  .login-box2left {
    width: 600px;
    margin: 50px 0;
    margin-left: 5%;
    margin-right: 10%;
    margin-left: 100px;
  }
  .login-box2-tit1 {
    margin-top: 40px;
    font-size: 40px;
    color: #57a0d7;
    margin-bottom: 10px;
    letter-spacing: 10px;
  }
  .login-box2-tit2 {
    font-size: 30px;
    color: #57a0d7;
    margin-bottom: 40px;
    letter-spacing: 7px;
  }
  .login-box2-txt1 {
    font-size: 30px;
    color: #000;
    margin-bottom: 10px;
    letter-spacing: 5px;
  }
  .login-box2-txt2 {
    font-size: 16px;
    color: #000;
    line-height: 40px;
    letter-spacing: 1px;
  }
  .login-box2right {
    margin: 50px 0;
    // margin-left: 50px;
    width: 700px;
    .right-title {
      color: #fff;
      font-size: 28px;
      text-align: center;
      padding-top: 10px;
      padding-bottom: 50px;
    }
  }
  @media screen and (max-device-width: 1600px) {
    .login-box2left {
      margin-left: 5%;
      margin-right: 5%;
    }
    .login-box2center {
      height: 85%;
      width: 1100px;
      margin: 0 auto;
      margin-top: 11%;
      display: flex;
    }
    .loginbackcolor {
      padding-top: 20px;
    }
    .right-title {
      padding-bottom: 30px !important;
    }
    .login-box2button {
      font-size: 20px;
      height: 45px;
      margin-top: 0 !important;
    }
  }
  @media screen and (max-device-width: 1400px) {
    .login-box2left {
      margin-left: 5%;
      margin-right: 5%;
    }
    .login-box2center {
      height: 85%;
      width: 1100px;
      margin: 0 auto;
      margin-top: 7%;
      display: flex;
    }
    .loginbackcolor {
      padding-top: 20px;
    }
    .right-title {
      padding-bottom: 30px !important;
    }
    .login-box2button {
      font-size: 20px;
      height: 45px;
      margin-top: 0 !important;
    }
  }
}
.login-item {
  margin-bottom: 40px !important;
  img {
    margin: 2px 10px 0 0;
    height: 23px;
    display: inline-block;
  }
}
.login-input {
  // background-color: white !important;
  border-radius: 5px;
  width: 90%;
  margin-bottom: 5px;
}
.loginbackcolor {
  background: url("./style/images/kuang.png") no-repeat;
  background-size: 100% 100%;
  // background-image: linear-gradient(to right, #4db1dc, #57a0d7);
  // border-radius: 20px;
  padding: 30px 100px 150px 100px;
}
.login-box2button {
  margin-left: 5%;
  width: 90%;
  height: 60px;
  font-size: 22px;
  font-weight: 400;
  line-height: 6px;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 30px;
  background-image: linear-gradient(to right, #fafafa, #f5f5f5);
}
</style>
<style>
.login-input .el-input__inner {
  border: 1px solid transparent !important;
  color: white;
}
.el-form-item__content {
  border-bottom: 1px solid white;
}
</style>
