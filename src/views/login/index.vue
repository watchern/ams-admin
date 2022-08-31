<template>
  <div class="login-outbox">
    <div class="login-center flex a-center j-end" v-if="skincontrol == 'old-login'">
      <div class="login-left">
        <img src="../../assets/img/bg-contend.png" alt="">
      </div>
      <div class="login-right-box">
        <div class="login-right flex a-center">
          <div class="logo-box">
            <img src="../../assets/img/login-logo.png" alt="">
          </div>
          <div class="login-form">
            <el-form
              ref="loginForm"
              :model="loginForm"
              :rules="loginRules"
              autocomplete="on"
              label-position="left"
            >
              <el-form-item prop="username" label="账户名称">
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
                <el-form-item prop="password" label="登录密码">
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
                @click.native.prevent="handleLogin"
              >
                {{ $t("login.logIn") }}
              </el-button>
            </el-form>
          </div>
        </div>
        <div class="copyright-text">中软国际<span>Corporation版权所有</span></div>
      </div>
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
    <div class ="lh-login" v-else-if="skincontrol == 'lh-login'">
        <div class="login_box">
            <div class="login_logo_box">
                <img src="@/assets/img/lh_logo.png" class="logo" alt="">
            </div>
            <div class="login_box_bg">
                <div class="login_box_content">
                    <div class="box_content_title">用户登录</div>
                    <div class="content_input_box">
                        <i class="content_input_icon"></i>
                        <el-input placeholder="请输入用户名" class="content_input" v-model="loginForm.username"></el-input>
                    </div>
                    <div class="content_input_box">
                        <i class="content_input_icon icon_mm"></i>
                        <el-input placeholder="请输入密码" type="password" class="content_input" v-model="loginForm.password">
                        </el-input>
                    </div>
                    <div class="content_input_box">
                        <i class="content_input_icon icon_yzm"></i>
                        <el-input class="content_input" placeholder="请输入验证码" v-model="loginForm.verificationcode"></el-input>
                    </div>

                    <el-button class="box_content_btn" @click.native.prevent="handleLogin">{{ $t("login.logIn") }}</el-button>
                </div>
            </div>
            <!-- <div class="logon_footer">
              <p class="logon_footer_text">
                Copyright © 1996-2022 深圳市龙华区智慧审计管理系统 All Rights Reserved <br> 粤ICP备20030184号-1
              </p>
            </div> -->
        </div>
<!--      <div class="lh-login-container2">-->
<!--        <div class="lh-login-box2-top">-->
<!--          <img  src="@/assets/img/lh_logo@2x.png" align="left" class="lh-login-box2-top-img"/>-->
<!--        </div>-->
<!--        <div-->
<!--                class="lh-login-box2"-->
<!--                :style="-->
<!--        backgroundImg ? 'background-image:url(' + backgroundImg + ');' : ''-->
<!--      "-->
<!--        >-->
<!--          <div class="lh-login-box2center">-->
<!--            <div class="lh-login-box2left">-->
<!--            </div>-->
<!--            <div class="lh-login-box2right">-->
<!--              <el-form-->
<!--                      ref="loginForm"-->
<!--                      :model="loginForm"-->
<!--                      class="lh-loginbackcolor"-->
<!--                      autocomplete="on"-->
<!--                      label-position="left"-->
<!--                      :rules="loginRules"-->
<!--              >-->
<!--                <div class="lh-title-container">-->
<!--                  <div class="lh-right-title">用户登录</div>-->
<!--                </div>-->
<!--                <div class="lh-right-container">-->
<!--                  <div class="lh-title-container">-->
<!--                  </div>-->

<!--                  <el-form-item prop="username" class="lh-login-item">-->
<!--                    <img src="@/assets/login_img/lh用户名.png" align="top" />-->
<!--                    <el-input-->
<!--                            ref="usernamenew"-->
<!--                            v-model="loginForm.username"-->
<!--                            name="username"-->
<!--                            type="text"-->
<!--                            tabindex="1"-->
<!--                            autocomplete="on"-->
<!--                            class="lh-login-input"-->
<!--                            placeholder="请输入账号"-->
<!--                    />-->
<!--                  </el-form-item>-->

<!--                  <el-tooltip-->
<!--                          v-model="capsTooltip"-->
<!--                          content="Caps lock is On"-->
<!--                          placement="right"-->
<!--                          manual-->
<!--                  >-->
<!--                    <el-form-item prop="password" class="lh-login-item">-->
<!--                      <img src="@/assets/login_img/lh密码.png" align="top" />-->
<!--                      <el-input-->
<!--                              :key="passwordType"-->
<!--                              ref="passwordnew"-->
<!--                              v-model="loginForm.password"-->
<!--                              :type="passwordType"-->
<!--                              name="password"-->
<!--                              tabindex="2"-->
<!--                              autocomplete="on"-->
<!--                              @keyup.native="checkCapslock"-->
<!--                              @blur="capsTooltip = false"-->
<!--                              @keyup.enter.native="handleLogin"-->
<!--                              class="lh-login-input"-->
<!--                              placeholder="请输入密码"-->
<!--                      />-->
<!--                      &lt;!&ndash; <span class="lh-show-pwd" @click="showPwd">-->
<!--                        <svg-icon-->
<!--                          :icon-class="-->
<!--                            passwordType === 'password' ? 'eye' : 'eye-open'-->
<!--                          "-->
<!--                        />-->
<!--                      </span> &ndash;&gt;-->
<!--                    </el-form-item>-->
<!--                  </el-tooltip>-->

<!--                  <el-form-item prop="verificationcode" class="lh-login-item">-->
<!--                    <img src="@/assets/login_img/lh验证码.png" align="top" />-->
<!--                    <el-input-->
<!--                            ref="verificationcodenew"-->
<!--                            v-model="loginForm.verificationcode"-->
<!--                            name="verificationcode"-->
<!--                            type="text"-->
<!--                            tabindex="1"-->
<!--                            autocomplete="on"-->
<!--                            class="lh-login-input"-->
<!--                            placeholder="请输入验证码"-->
<!--                    />-->
<!--                  </el-form-item>-->
<!--                  <el-button-->
<!--                          :loading="loading"-->
<!--                          class="lh-login-box2button"-->
<!--                          @click.native.prevent="handleLogin"-->
<!--                  >-->
<!--                    {{ $t("login.logIn") }}-->
<!--                  </el-button>-->
<!--                </div>-->
<!--              </el-form>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--&lt;!&ndash;        <div class="lh-login-box2-bottom">&ndash;&gt;-->
<!--&lt;!&ndash;          <div class="lh-login-box2-bottom-text">Copyright © 1996-2022 深圳市龙华区智慧审计管理系统 All Rights Reserved&ndash;&gt;-->
<!--&lt;!&ndash;            <br/>粤ICP备20030184号-1   </div>&ndash;&gt;-->
<!--&lt;!&ndash;        </div>&ndash;&gt;-->
<!--      </div>-->
    </div>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";
// import LangSelect from '@/components/LangSelect'

export default {
  name: "Login",

  // components: { LangSelect },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error("请输入账号!"));
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
                this.$router.push({
                  path: this.redirect || "/",
                  query: this.otherQuery,
                });
                this.loading = false;
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            this.$message.error("用户名或密码不能为空!");
            return false;
          }
        });
      } else if (this.skincontrol == "old-login") {
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.$store
              .dispatch("user/login", this.loginForm)
              .then(() => {
                this.$router.push({
                  path: this.redirect || "/",
                  query: this.otherQuery,
                });
                this.loading = false;
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
          this.loading = true;
          this.$store
              .dispatch("user/login", this.loginForm)
              .then(() => {
                  this.$router.push({
                      path: this.redirect || "/",
                      query: this.otherQuery,
                  });
                  this.loading = false;
              })
              .catch(() => {
                  this.loading = false;
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
  background: #f0f3f5;
  background-image: url(../../assets/img/bg-top.png),url(../../assets/img//bg-bottom.png);
  background-repeat: no-repeat, no-repeat;
  background-position: right top, left bottom;
  min-height: 100%;
  overflow: hidden;
  .login-center {
    height: 100%;
    width: 100%;
    // margin-top: 10vh;
    .login-right-box{
      margin-right: 270px;
    }
    .login-right {
      background: #E3EDF7;
      background: #FFFFFF;
      box-shadow: 5px 8px 14px 0px rgba(147,194,228,0.56);
      border-radius: 10px;
      height: 550px;
      width: 420px;
      margin-left: -100px;
      flex-direction: column;
      .logo-box {
        margin-top: 90px;
      }
      .login-form {
        margin-top: 43px;
        ::v-deep .el-form {
          .el-form-item {
            margin-bottom: 32px !important;
          }
          .el-form-item__label {
            font-family: MicrosoftYaHei-Bold;
            font-size: 12px;
            color: #999999;
            letter-spacing: -0.88px;
            line-height: 28px;
            font-weight: 700;
          }
          .el-form-item__content {
            width: 275px;
            .el-input {
              position: relative;
              .el-input__inner {
                border: none !important;
                border-bottom: 1px solid #d1d1d1 !important;
                outline: none;
              }
            }
            .show-pwd {
              right: 10px;
              font-size: 16px;
              color: #889aa4;
              cursor: pointer;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              position: absolute;
            }
          }
          
          .el-button {
            background: #529ED4;
            border-radius: 19px;
            width: 270px;
            height: 38px;
            font-family: MicrosoftYaHei;
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 1.17px;
            font-weight: 400;
            margin-top: 12px;
          }
        }
      }
     
    }
    .copyright-text {
      margin-top: 30px;
      font-family: PingFangSC-Medium;
      font-size: 12px;
      color: #BBBBBB;
      letter-spacing: 0.26px;
      text-align: right;
      font-weight: 500;
      margin-right: 100px;
      span {
        margin-left: 18px;
      }
    }
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
    // background-image: url(../../styles/image/bgcolor.png);
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
//linux貌似不支持
// $bg: #fdfdfd url("../../assets/login_img/背景.png") no-repeat left center fixed;
.login-box2 {
  width: 100%;
  height: 100%;
  overflow: hidden;
  //new-login本地背景图在这里修改
  background: #fdfdfd url("../../assets/login_img/BG.png") no-repeat left center fixed;
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
    .loginbackcolor{
      padding-top: 20px;
    }
    .right-title{
      padding-bottom: 30px !important;
    }
    .login-box2button{
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
    .loginbackcolor{
      padding-top: 20px;
    }
    .right-title{
      padding-bottom: 30px !important;
    }
    .login-box2button{
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
<style lang="scss" scoped>
.lh-login{
    .login_box {
        height: 100vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .login_logo_box {
            .logo {
                display: inline-block;
                // height: 70px;
                width: 41vw;
                min-width: 435px;
                height: auto;
                margin: 1vh 2.44vw;
                flex: 1;
            }

        }

        .login_box_bg {
            height: 100%;
            width: 100vw;
            background: url("../../assets/login_img/lhBG.png");
            background-repeat: no-repeat;
            background-size: cover;

            .login_box_content {
                width: 22.7vw;
                height: 36.8vh;
                min-width: 322px;
                min-height: 344px;
                position: absolute;
                top: 30vh;
                right: 12vw;
                background-color: #fff;
                padding: 2.5vh 2vw 1vh 2vw;
                box-shadow: 10px 10px 30px 5px #555353;
                border-radius: 10px;

                .box_content_title {
                    font-size: 30px;
                    font-weight: 600;
                    color: #00A0E9;
                    margin-bottom: 20px;
                    letter-spacing: 3px;
                }

                .content_input_box {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    margin-bottom: 18px;

                    .content_input_icon {
                        width: 26px;
                        height: 26px;
                        margin-right: 11px;
                        display: inline-block;
                        background: url("../../assets/login_img/lhUSER.png");
                        background-repeat: no-repeat;
                        background-size: cover;
                    }

                    .icon_mm {
                        background: url("../../assets/login_img/lhPD.png");
                        background-size: 100% 100%;

                    }

                    .icon_yzm {
                        background: url("../../assets/login_img/lhYZM.png");
                        background-size: 100% 100%;

                    }


                    .content_input ::v-deep .el-input__wrapper {
                        background: #F7F7F7 !important;
                        border-radius: 49.79px;
                        border: 0;
                        min-width: 268px;
                    }

                    .content_input ::v-deep .el-input__inner {
                        background: #F7F7F7 !important;
                        border-radius: 49.79px;
                        height: 42px;
                        padding-left: 15px !important;
                        border: 0;
                        color: #333;
                    }
                    .content_input ::v-deep .el-input__inner::placeholder {
                        color: #999 !important;
                        letter-spacing: 1.5px !important;
                        font-size: 13px !important;
                    }

                }

                .box_content_btn {
                    margin-top: 10px;
                    width: 100%;
                    background-image: linear-gradient(161deg, #00B8FD 0%, #4390FF 84%);
                    color: #FFFFFF;
                    font-size: 18px;
                    /*line-height: 52px;*/
                    height: 42px;
                    border-radius: 50px;
                    letter-spacing: 3px;
                }
            }
        }

        .logon_footer {
            width: 100vw;
            text-align: center;

            .logon_footer_text {
                width: 100%;
                text-align: center;
                margin: 1.77vw 0 0 0;
                font-size: 16px;
            }
        }
    }

    @media (max-width:1080px) {
        .login_box {
            .login_box_bg {
                .login_box_content {

                    padding: 20px 20px 15px 20px;

                    .box_content_title {
                        margin-bottom: 15px;
                        letter-spacing: 3px;
                    }

                    .content_input_box {
                        margin-bottom: 15px;

                        .content_input_icon {
                            display: none;
                        }



                        .content_input ::v-deep .el-input__inner {
                            height: 46px;
                        }
                    }

                    .box_content_btn {
                        margin-top: 10px;
                    }
                }
            }
        }

    }

    .el-input__inner::placeholder {
        color: #fff;
        text-align: center;
    }

    /* 谷歌 */
    .el-input__inner::-webkit-input-placeholder {
        color: #fff;
        text-align: center;
    }

    /* 火狐 */
    .el-input__inner:-moz-placeholder {
        color: #fff;
        text-align: center;
    }

    /*ie*/
    .el-input__inner:-ms-input-placeholder {
        color: #fff;
        text-align: center;
    }

    .ele-logo-bg {
        width: 60px;
        height: 50px;
        // background: url("../assets/logo.png") no-repeat 100%/100% 100%;
        background: url("../../assets/img/lh_logo.png") no-repeat;
        background-size: cover;
    }
}
</style>
