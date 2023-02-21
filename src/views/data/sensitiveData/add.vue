<template>
  <div style="padding: 20px 0"
       v-loading="loading">
    <el-form label-position="top"
             :model="apComDataBaseData"
             :rules="rules"
             label-width="110px"
             class="demo-ruleForm"
             ref="ruleForm">
      <el-form-item label="规则名称"
                    prop="ruleName"
                    class="item-b">
        <el-input v-model="apComDataBaseData.ruleName"
                  maxlength="200"
                  style="width: 100%"></el-input>
      </el-form-item>
      <el-form-item label="启动"
                    prop="isAtartUp"
                    class="item-b">
        <el-radio-group v-model="apComDataBaseData.isAtartUp">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="数据密级"
                    prop="secretLevelName"
                    class="item-b">
        <el-select v-model="apComDataBaseData.secretLevelName"
                   filterable
                   clearable
                   size="small"
                   style="width: 100%"
                   @change="secretLevelChange">
          <el-option v-for="item in secretLevelList"
                     :key="item.id"
                     :label="item.name"
                     :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="识别规则"
                    prop="recognitionRulesName"
                    class="item-b">
        <el-select v-model="apComDataBaseData.recognitionRulesName"
                   filterable
                   clearable
                   size="small"
                   style="width: 100%"
                   @change="recognitionRulesChange">
          <el-option v-for="item in listType"
                     :key="item.id"
                     :label="item.name"
                     :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="正则表达式"
                    prop="regularExpression"
                    class="item-b">
        <el-input type="textarea"
                  v-model="apComDataBaseData.regularExpression"
                  placeholder="请输入内容"
                  style="width: 100%"
                  :rows="4"></el-input>
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button size="small"
                 @click="close('ruleForm')">取消</el-button>
      <el-button size="small"
                 type="primary"
                 @click="submitForm('ruleForm')">保存</el-button>

    </div>
  </div>
</template>

<script>
import { save, updateSensitive } from "@/api/data/sensitiveData";
import Cookies from "js-cookie";
export default {
  name: "add",
  components: {},
  props: ["sensitiveObj"],
  data () {
    return {
      listType: [{ name: "正则表达式", id: "1" }],
      secretLevelList: [
        { name: "一级", id: "1" },
        { name: "二级", id: "2" },
        { name: "三级", id: "3" },
      ],
      // form对象
      apComDataBaseData: {
        bizSensitiveUuid: "",
        ruleName: "",
        isAtartUp: 0,
        secretLevelName: "",
        secretLevelCode: "",
        recognitionRulesName: "",
        recognitionRulesCode: "",
        regularExpression: "",
        createUserName: "",
        createUserUuid: "",
      },
      //   form校验
      rules: {
        ruleName: [{ required: true, message: "请输入", trigger: "blur" }],
        isAtartUp: [{ required: true, message: "请选择", trigger: "change" }],
        secretLevelName: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        recognitionRulesName: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        regularExpression: [
          { required: true, message: "请输入", trigger: "blur" },
        ],
      },
      loading: false,
    };
  },
  computed: {},
  watch: {},
  mounted () {
    if (this.sensitiveObj.bizSensitiveUuid) {
      this.apComDataBaseData = this.sensitiveObj;
    }
  },
  methods: {
    //   保存
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (!this.apComDataBaseData.bizSensitiveUuid) {
            let user = JSON.parse(Cookies.get("user"));
            this.apComDataBaseData.createUserName = user.userName;
            this.apComDataBaseData.createUserUuid = user.userName;
            this.loading = true;
            save(this.apComDataBaseData).then((res) => {
              if (res.code === 0) {
                this.$message.success("保存成功");
                this.loading = false;
                this.$emit("ok");
              } else {
                this.$message({
                  message: res.msg,
                  type: "error",
                });
              }
            });
          } else {
            this.loading = true;
            updateSensitive(this.apComDataBaseData).then((res) => {
              if (res.code === 0) {
                this.$message.success("修改成功");
                this.loading = false;
                this.$emit("ok");
              } else {
                this.$message({
                  message: res.msg,
                  type: "error",
                });
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    close (formName) {
      this.$refs[formName].resetFields();
      this.$emit("close");
    },
    secretLevelChange (data) {
      this.secretLevelList.forEach((item) => {
        if (item.id === data) {
          this.apComDataBaseData.secretLevelName = item.name;
          this.apComDataBaseData.secretLevelCode = item.id;
        }
      });
    },
    recognitionRulesChange (data) {
      this.listType.forEach((item) => {
        if (item.id === data) {
          this.apComDataBaseData.recognitionRulesName = item.name;
          this.apComDataBaseData.recognitionRulesCode = item.id;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.demo-ruleForm {
  display: flex;
  flex-wrap: wrap;
  .el-select {
    width: 100%;
  }
  ::v-deep .el-form-item {
    margin-bottom: 22px !important;
  }
  ::v-deep .el-form-item__label {
    text-align: right;
    vertical-align: middle;
    float: left !important;
  }
  .el-radio{
    padding-left:10px;
  }
}
</style>
