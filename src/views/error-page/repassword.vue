<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pointrepassword">
        ※密码必须包含数字，字母和特殊字符(8到20位)
      </div>
      <div class="bullshitrepassword">
        <el-form
          :model="ruleForm"
          status-icon
          :rules="rules"
          ref="ruleForm"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="旧密码" prop="oldpassword">
            <el-input v-model="ruleForm.oldpassword"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="pass">
            <el-input
              type="password"
              v-model="ruleForm.pass"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="checkPass">
            <el-input
              type="password"
              v-model="ruleForm.checkPass"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')"
              >提交</el-button
            >
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { repass } from "@/api/user";
export default {
  data() {
    var checkoldpassword = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("旧密码不能为空"));
      } else {
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      let FloatRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>,.\/]).{8,20}/;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (!FloatRegex.test(value)) {
          callback(new Error("密码必须包含数字特殊字符和字母(8到20位)"));
        } else {
          if (this.ruleForm.checkPass !== "") {
            this.$refs.ruleForm.validateField("checkPass");
          }
          callback();
        }
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        pass: "",
        checkPass: "",
        oldpassword: "",
      },
      rules: {
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        oldpassword: [{ validator: checkoldpassword, trigger: "blur" }],
      },
    };
  },
  methods: {
    gologin() {
      this.$router.push({ path: "/login" });
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          repass({
            password: this.ruleForm.oldpassword,
            newPassword: this.ruleForm.pass,
          }).then((response) => {
            if (response.code == 0) {
              this.$message.success("修改密码成功!");
              window.setTimeout(this.gologin, 2000);
            } else {
              this.$message.error(response.msg);
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
      //   $.ajax({
      //     type: "post",
      //     url: "/updatePassword",
      //     dataType: "json",
      //     async: false,
      //     data: {
      //       password: this.ruleForm.pass,
      //       newPassword: this.ruleForm.oldpassword,
      //     },
      //     success: function (e) {
      //       console.log(e);
      //     },
      //   });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
};
</script>

<style lang="scss" scoped>
.wscn-http404-container {
  transform: translate(-50%, -50%);
  position: absolute;
  top: 35%;
  left: 50%;
}
.wscn-http404 {
  position: relative;
  padding: 0 50px;
  .pointrepassword {
    font-size: 20px;
    color: #ff4949;
    padding: 25px;
  }
  .bullshitrepassword {
    position: relative;
    // float: left;
    width: 600px;
    padding: 30px 50px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    border: 1px solid #1482f0;
    box-shadow: 0px 5px 20px #7bb9f6;
    &__oops {
      font-size: 64px;
      font-weight: bold;
      line-height: 40px;
      color: #1482f0;
      opacity: 0;
      margin-bottom: 20px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }
    &__headline {
      font-size: 20px;
      line-height: 24px;
      color: #222;
      font-weight: bold;
      opacity: 0;
      margin-bottom: 10px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }
    &__info {
      font-size: 13px;
      line-height: 21px;
      color: grey;
      opacity: 0;
      margin-bottom: 30px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }
    &__return-home {
      display: block;
      float: left;
      width: 110px;
      height: 36px;
      background: #1482f0;
      border-radius: 100px;
      text-align: center;
      color: #ffffff;
      opacity: 0;
      font-size: 14px;
      line-height: 36px;
      cursor: pointer;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }
    @keyframes slideUp {
      0% {
        transform: translateY(60px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
}
</style>
<style>
.bullshitrepassword .el-form-item {
  padding-bottom: 25px;
}
.bullshitrepassword .el-form-item__label {
  float: left !important;
}
</style>
