<template>
  <div class="tab-content">
    <div id="basicInfo">
      <el-form
        id="ammParamAdd"
        :model="form"
        class="detail-form"
        style="height: 62vh; overflow: auto"
        :rules="rules"
        ref="ruleForm"
      >
        <input type="hidden" id="paramUuid" />
        <input id="inputTypeStr" type="hidden" />
        <input id="dataTypeStr" type="hidden" />
        <input id="typeUuid" type="hidden" />
        <input type="hidden" id="treeId" name="treeId" />
        <input id="scopeType" type="hidden" name="scopeType" />
        <input id="scopeUuid" type="hidden" name="scopeUuid" />
        <input id="timesUuid" type="hidden" name="timesUuid" />
        <input name="choiceUuid" id="choiceUuid" type="hidden" />
        <input id="flag" type="hidden" name="flag" />
        <el-row>
          <el-col :span="24">
            <el-form-item label="参数名称" prop="paramName">
              <el-input
                v-model="form.paramName"
                id="paramName"
                placeholder="参数名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="数据类型" prop="dataType">
              <el-select
                v-model="form.dataType"
                @change="changeValue"
                id="dataType"
                name="dataType"
              >
                <el-option value="" key="" label="请选择"></el-option>
                <el-option
                  v-for="dataType in this.dataTypes"
                  :value="dataType.codeValue"
                  :key="dataType.codeValue"
                  :label="dataType.codeName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="输入方式" prop="inputType">
              <el-select
                v-model="form.inputType"
                @change="changeInputType"
                id="inputType"
                name="inputType"
              >
                <el-option value="" key="" label="请选择"></el-option>
                <el-option
                  v-for="inputType in this.inputTypes"
                  :value="inputType.codeValue"
                  :key="inputType.codeValue"
                  :label="inputType.codeName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="this.isShowElement.dateFormatTag">
          <el-col :span="12">
            <el-form-item label="日期单位" prop="dataType">
              <el-select v-model="form.timeFormat" @change="changeTimeValue">
                <el-option value="" label="请选择"></el-option>
                <el-option value="year" label="年"></el-option>
                <el-option value="month" label="月"></el-option>
                <el-option value="date" label="日"></el-option>
                <el-option value="other" label="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="自定义其他格式"
              prop="dataType"
              v-if="this.isShowElement.customizeFormatTag"
            >
              <el-input
                v-model="form.customizeFormat"
                placeholder="请输入其他格式"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="示例" prop="example">
            <el-input
              name="example"
              id="example"
              v-model="form.example"
              autocomplete="off"
              placeholder="示例"
            />
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="允许为空">
              <el-radio-group v-model="form.allowedNull">
                <el-radio id="allowedNull" :label="1" value="1">是</el-radio>
                <el-radio id="allowedNull1" :label="0" value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <div
          id="dataLengthInterVal"
          v-show="this.isShowElement.dataLengthInterValShow"
        >
          <el-form-item label="参数值长度" prop="dataLength">
            <el-input
              v-model.number="form.dataLength"
              id="dataLength"
              placeholder="参数值长度"
              autocomplete="false"
            />
          </el-form-item>
        </div>
        <!--        <div class="form-group" id="timeInterval" v-show="this.isShowElement.timeIntervalShow">
          <el-form-item label="最大间隔时间" prop="maxIntervalVal">
            <el-col :span="10">
              <el-input v-model="form.maxIntervalVal" id="maxIntervalVal" placeholder="最大间隔时间"/>
            </el-col>
            <el-col :span="10" style="margin-left: 20px;">
              <el-select id="maxIntervalUnit" v-model="form.maxIntervalUnit" name="maxIntervalUnit">
                <el-option value="" key="" label="请选择"></el-option>
                <el-option v-for="maxIntervalUnit in this.maxIntervalUnits" :value="maxIntervalUnit.codeValue"  :key="maxIntervalUnit.codeValue" :label="maxIntervalUnit.codeName"></el-option>
              </el-select>
            </el-col>
          </el-form-item>
        </div>-->
        <div id="formalType" v-show="this.isShowElement.formalTypeShow">
          <el-row>
            <el-col :span="24">
              <el-form-item label="形式类型">
                <el-radio-group v-model="form.formalType">
                  <el-radio id="choiceType" name="choiceType" :label="'1'"
                    >单选</el-radio
                  >
                  <el-radio id="choiceType1" name="choiceType" :label="'0'"
                    >多选</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div id="alternateValue" v-show="this.isShowElement.alternateValueShow">
          <el-row>
            <el-form-item label="备选值设置">
              <el-tabs
                v-model="activeName"
                type="card"
                @tab-click="tabsigntree"
              >
                <el-tab-pane label="自定义静态" name="custom">
                  <div id="customStatic">
                    <el-input
                      name="name"
                      v-model="defaultExistsCustomStaticValues.uuid"
                      v-show="false"
                      autocomplete="off"
                      placeholder="名称"
                    />
                    <el-col :span="9">
                      <el-input
                        name="name"
                        v-model="defaultExistsCustomStaticValues.names"
                        autocomplete="off"
                        placeholder="名称"
                      />
                    </el-col>
                    <el-col :span="9" style="margin-left: 20px">
                      <el-input
                        name="value"
                        v-model="defaultExistsCustomStaticValues.values"
                        autocomplete="off"
                        placeholder="值"
                      />
                    </el-col>
                    <el-col :span="2">
                      <el-button
                        id="addStaticData"
                        type="primary"
                        class="oper-btn add"
                        @click="addStaticData()"
                      ></el-button>
                    </el-col>
                    <div
                      v-for="(customStaticValue, index) in this
                        .customStaticValues"
                    >
                      <el-input
                        name="name"
                        v-model="customStaticValue.uuid"
                        v-show="false"
                        autocomplete="off"
                        placeholder="名称"
                      />
                      <el-col :span="9">
                        <el-input
                          name="name"
                          v-model="customStaticValue.names"
                          autocomplete="off"
                          placeholder="名称"
                        ></el-input>
                      </el-col>
                      <el-col :span="9" style="margin-left: 20px">
                        <el-input
                          name="value"
                          v-model="customStaticValue.values"
                          autocomplete="off"
                          placeholder="值"
                        ></el-input>
                      </el-col>
                      <el-col :span="2">
                        <el-button
                          id="addStaticData"
                          type="primary"
                          class="oper-btn delete"
                          @click="deleteStaticData(index)"
                        ></el-button>
                      </el-col>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="SQL动态" name="SQL">
                  <div name="SQLd" id="SQLd">
                    <el-input
                      type="textarea"
                      v-model="form.paramChoice.optionsSqlLine"
                      name="optionsSqlline"
                      id="optionsSqlline"
                      autocomplete="off"
                      :placeholder="getSqlRule(1)"
                    />
                    <!--                    <el-button type="primary" @click="viewSqlRule(1)" class="btn btn-primary">查看SQL规则</el-button>-->
                    <el-button
                      type="primary"
                      @click="sqlPreview(1)"
                      class="btn btn-primary"
                      >预览</el-button
                    >
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-form-item>
          </el-row>
        </div>
        <div
          name="SQLdtree"
          id="SQLdtree"
          v-show="this.isShowElement.SQLdtreeShow"
        >
          <el-input
            type="textarea"
            v-model="form.paramChoice.optionsSql"
            name="optionsSql"
            id="optionsSql"
            autocomp
            lete="off"
            :placeholder="getSqlRule(2)"
          />
          <!--          <el-button type="primary" @click="viewSqlRule(2);" c  lass="btn btn-primary">查看SQL规则</el-button>-->
          <el-button
            type="primary"
            @click="sqlPreview(2)"
            class="btn btn-primary"
            >预览</el-button
          >
        </div>
        <el-row>
          <el-form-item label="说明">
            <el-input
              name="description"
              v-model="form.description"
              type="textarea"
              id="description"
              autocomplete="off"
              placeholder="说明"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <el-dialog
        :append-to-body="true"
        :close-on-click-modal="false"
        v-if="seeSqlDataDialog"
        title="数据预览"
        :visible.sync="seeSqlDataDialog"
      >
        <seeSqlData :seeDataSql="seeDataSql" ref="seeSqlData"></seeSqlData>
        <div slot="footer" class="dialog-footer">
          <el-button @click="seeSqlDataDialog = false">取 消</el-button>
        </div>
      </el-dialog>
      <el-dialog
        :append-to-body="true"
        :close-on-click-modal="false"
        v-if="SQLRuleDialog"
        title="SQL规则"
        :visible.sync="SQLRuleDialog"
      >
        <el-input
          :autosize="{ minRows: 2, maxRows: 5 }"
          type="textarea"
          :disabled="true"
          v-model="SQLRuleText"
        >
        </el-input>
        <div slot="footer" class="dialog-footer">
          <el-button @click="SQLRuleDialog = false">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import $ from "jquery";
import seeSqlData from "@/views/analysis/modelparam/paramManager/seesqldata";
import { getUuid } from "@/api/analysis/common";
export default {
  props: ["selectTreeNode", "operationObj"],
  components: { seeSqlData },
  data() {
    return {
      rules: {
        paramName: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
        dataType: [
          { required: true, message: "请输入数据类型", trigger: "blur" },
        ],
        inputType: [
          { required: true, message: "请输入输入方式", trigger: "blur" },
        ],
        example: [
          { required: true, message: "请输入示例", trigger: "blur" },
        ],
      },
      //表单属性
      form: {
        paramName: "",
        dataType: "",
        inputType: "",
        allowedNull: "",
        dataLength: "",
        maxIntervalVal: "",
        maxIntervalUnit: "",
        formalType: "",
        description: "",
        example: "",
        folderId: "",
        paramChoice: {
          optionsSql: "",
          optionsSqlLine: "",
        },
      },
      //页签属性
      activeName: "custom",
      analysisUrl: "/analysis",
      setJsonSelectValueData: {},
      dataTypes: [],
      maxIntervalUnits: [],
      inputTypes: [],
      SQLRuleDialog: false,
      //查看数据时候的sql
      seeDataSql: "",
      //数据类型
      map_data_input: {
        num: {
          type: ["textinp", "lineinp", "treeinp"],
        },
        str: {
          type: ["textinp", "lineinp", "treeinp"],
        },
        date: {
          type: ["timeinp"],
        },
      },
      //输入类型
      initivalInputtype: "",
      //数据类型
      initivalDatatype: "",
      inputTypeValueStr: null,
      //是否显示div
      isShowElement: {
        timeIntervalShow: false,
        formalTypeShow: false,
        alternateValueShow: false,
        SQLdtreeShow: false,
        dataLengthInterValShow: false,
        //日期单位
        dateFormatTag: false,
        //新增自定义日期格式
        customizeFormatTag: false,
      },
      //是否存储sql的标志位
      tabsigns: 0,
      //自定义静态值绑定
      customStaticValues: [],
      defaultExistsCustomStaticValues: {
        names: "",
        values: "",
        uuid: "123456",
      },
      //查看数据dialog
      seeSqlDataDialog: false,
      SQLRuleText: "",
      updateParamObj: {},
      sqlRulesDesc: {
        list: "格式：SELECT A,B FROM 模式.C\nA:真实值，B:显示值，若字段过多,则默认只使用前两列进行真实值与显示值的匹配",
        tree: "格式：SELECT A,B,C FROM 模式.D\nA:子项真实值，B:子项显示值，C：父项真实值，将使用【A】字段与【C】字段进行父子节点关系匹配，若字段过多（或者存在【*】），则默认只使用前三列进行匹配",
      },
    };
  },
  created() {
    //初始化文件夹编号
    this.form.folderId = this.selectTreeNode.id;
    this.maxIntervalUnits = this.setJsonSelectValue(
      "maxIntervalUnit",
      "/paramController/loadDict?codeType=maxIntervalUnit"
    );
    this.dataTypes = this.setJsonSelectValue(
      "dataType",
      "/paramController/loadDict?codeType=dataType"
    );
    this.inputTypeValueStr = this.setJsonSelectValue(
      "inputType",
      "/paramController/loadDict?codeType=inputType",
      "",
      ""
    );
  },
  mounted() {
    if (this.operationObj.operationType == 2) {
      //反显参数数据
      this.displayParamData();
    }
  },
  methods: {
    displayParamData() {
      let that = this;
      $.post(
        this.analysisUrl + "/paramController/findByUuid",
        { ammParamUuid: this.operationObj.paramUuid },
        function (e) {
          that.updateParamObj = e.data;
          var data = e.data; //参数基本信息
          if (data != null && data != "") {
            that.form.paramName = data.paramName;
            that.form.dataType = data.dataType;
            that.changeValue(data.dataType);
            that.form.inputType = data.inputType;
            that.changeInputType(data.inputType);
            if (data.inputType == "textinp") {
              that.form.dataLength = data.dataLength;
            }
            that.form.example = data.example;
            if (data.paramChoice) {
              that.form.formalType = data.paramChoice.choiceType;
              that.form.allowedNull = data.paramChoice.allowedNull;
              $("#choiceUuid").val(data.paramChoice.ammParamChoiceUuid);
              if (data.paramChoice.ammParamChoiceUuid) {
                if (
                  data.paramChoice.ammParamOptionsList &&
                  data.paramChoice.ammParamOptionsList.length > 0
                ) {
                  that.tabsigns = 0;
                  for (
                    var i = 0;
                    i < data.paramChoice.ammParamOptionsList.length;
                    i++
                  ) {
                    if (i == 0) {
                      that.defaultExistsCustomStaticValues.names =
                        data.paramChoice.ammParamOptionsList[i].optionsName;
                      that.defaultExistsCustomStaticValues.values =
                        data.paramChoice.ammParamOptionsList[i].optionsVal;
                      that.defaultExistsCustomStaticValues.uuid =
                        data.paramChoice.ammParamOptionsList[
                          i
                        ].ammParamOptionsUuid;
                    } else {
                      //整理数据对象
                      that.customStaticValues.push({
                        names:
                          data.paramChoice.ammParamOptionsList[i].optionsName,
                        values:
                          data.paramChoice.ammParamOptionsList[i].optionsVal,
                        uuid: data.paramChoice.ammParamOptionsList[i]
                          .ammParamOptionsUuid,
                      });
                    }
                  }
                } else {
                  that.tabsigns = 1;
                  if (data.inputType == "treeinp") {
                    that.form.paramChoice.optionsSql =
                      data.paramChoice.optionsSql;
                  } else {
                    that.activeName = "SQL";
                    that.form.paramChoice.optionsSqlLine =
                      data.paramChoice.optionsSql;
                  }
                }
              }
            }

            that.form.description = data.description;
            if (data.paramTimes) {
              $("#timesUuid").val(data.paramTimes.ammParamTimesUuid);
              that.form.timeFormat = data.paramTimes.timeFormat;
              if (that.form.timeFormat == "other") {
                that.isShowElement.customizeFormatTag = true;
                that.form.customizeFormat = data.paramTimes.customizeFormat;
              }
              that.form.maxIntervalVal = data.paramTimes.maxIntervalVal;
              if (
                null != data.paramTimes.ammParamTimesUuid &&
                "" != data.paramTimes.ammParamTimesUuid
              ) {
                that.form.maxIntervalUnit = data.paramTimes.maxIntervalUnit;
              }
            }
          }
        },
        "json"
      );
    },
    setJsonSelectValue(selectId, url) {
      let result;
      let that = this;
      var data;
      $.ajax({
        url: this.analysisUrl + url,
        cache: true,
        type: "POST",
        async: false,
        dataType: "json",
        success: function (redata, textStatus, jqXHR) {
          result = JSON.parse(redata.data);
        },
        error: function (data, textStatus, jqXHR) {
          alertMsg(
            "提示",
            "加载数据字典" +
              textStatus +
              ",selectId:" +
              selectId +
              ",url:" +
              url,
            "error"
          );
        },
      });
      return result;
    },
    // optionsSqllineplaceholders_1(){
    //   return "格式：SELECT A,B FROM 模式.C\n" +
    //           "A:真实值，B:显示值，若字段过多,则默认只使用前两列进行真实值与显示值的匹配";
    // },
    // optionsSqllineplaceholders_2(){
    //   return "格式：SELECT A,B,C FROM 模式.D\n" +
    //           "A:子项真实值，B:子项显示值，C：父项真实值，将使用【A】字段与【C】字段进行父子节点关系匹配，若字段过多（或者存在【*】），则默认只使用前三列进行匹配"
    // },
    changeInputType(inputTypeValue) {
      if (inputTypeValue != "") {
        if (inputTypeValue == "timeinp") {
          //日期选择器
          this.isShowElement.timeIntervalShow = true;
          this.isShowElement.formalTypeShow = false;
          this.isShowElement.alternateValueShow = false;
          this.isShowElement.dataLengthInterValShow = false;
          this.isShowElement.SQLdtreeShow = false;
          this.isShowElement.dateFormatTag = true;
        } else if (inputTypeValue == "lineinp") {
          //下拉列表
          this.isShowElement.timeIntervalShow = false;
          this.isShowElement.formalTypeShow = true;
          this.isShowElement.alternateValueShow = true;
          this.isShowElement.dataLengthInterValShow = false;
          this.isShowElement.SQLdtreeShow = false;
          this.isShowElement.dateFormatTag = false;
        } else if (inputTypeValue == "treeinp") {
          //下拉树
          this.isShowElement.timeIntervalShow = false;
          this.isShowElement.formalTypeShow = true;
          this.isShowElement.alternateValueShow = false;
          this.isShowElement.dataLengthInterValShow = false;
          this.isShowElement.SQLdtreeShow = true;
          this.tabsigns = 1;
          this.isShowElement.dateFormatTag = false;
        } else {
          //文本
          this.isShowElement.timeIntervalShow = false;
          this.isShowElement.formalTypeShow = false;
          this.isShowElement.alternateValueShow = false;
          this.isShowElement.dataLengthInterValShow = true;
          this.isShowElement.SQLdtreeShow = false;
          this.isShowElement.dateFormatTag = false;
        }
      }
    },
    changeValue(dataTypeValue) {
      this.inputTypes = [];
      this.form.inputType = "";
      for (var i = 0; i < this.inputTypeValueStr.length; i++) {
        if (dataTypeValue == "" || dataTypeValue == null) {
          this.inputTypes = [];
        } else {
          var typesz = this.map_data_input[dataTypeValue].type;
          if (typesz.indexOf(this.inputTypeValueStr[i].codeValue) > -1) {
            this.inputTypes.push(this.inputTypeValueStr[i]);
          }
        }
      }
    },
    //更改日期格式-其他
    changeTimeValue(dataTypeValue) {
      if (dataTypeValue == "other") {
        this.isShowElement.customizeFormatTag = true;
      } else {
        this.isShowElement.customizeFormatTag = false;
      }
    },
    tabsigntree() {
      if (this.activeName === "SQL") {
        this.tabsigns = 1;
      } else {
        this.tabsigns = 0;
      }
    },
    addStaticData() {
      this.customStaticValues.push({ names: "", values: "", uuid: getUuid() });
    },
    deleteStaticData(index) {
      this.customStaticValues.splice(index, 1);
    },
    okBtn() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          if (this.operationObj.operationType == 1) {
            this.saveParam();
          } else {
            this.updateParam();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    /**
     * 保存参数
     */
    saveParam() {
      let that = this;
      var paramName = this.form.paramName;
      var dataType = this.form.dataType;
      var inputType = this.form.inputType;
      var example = this.form.example;
      var dataLength = this.form.dataLength;
      var ammParamTypeUuid = this.form.paramName;
      var description = this.form.description;
      var folderId = this.form.folderId;
      var allowedNull = this.form.allowedNull;
      var dataParam = {
        "param.paramName": paramName,
        "param.dataType": dataType,
        "param.inputType": inputType,
        "param.example": example,
        "param.dataLength": dataLength,
        "param.description": description,
        "param.ammParamTypeUuid": ammParamTypeUuid,
        "paramChoice.allowedNull": allowedNull,
        "param.signForSql": this.tabsigns,
        "param.paramFolderUuid": folderId,
      };
      if (paramName === "") {
        this.$message({ type: "info", message: "参数名不能为空!" });
        return;
      } else if (dataType === "") {
        this.$message({ type: "info", message: "数据类型不能为空!" });
        return;
      } else if (inputType === "") {
        this.$message({ type: "info", message: "输入类型不能为空!" });
        return;
      } else if (example === "") {
        this.$message({ type: "info", message: "示例不能为空!" });
        return;
      }

      //时间间隔相关代码 注释掉，好像没用
      /*      if(this.isShowElement.timeIntervalShow){
        dataParam["paramTimes.maxIntervalUnit"] = $("#maxIntervalUnit").val();
        dataParam["paramTimes.maxIntervalVal"] = $("#maxIntervalVal").val();
      }*/
      //新增时间格式
      if (this.isShowElement.dateFormatTag) {
        dataParam["paramTimes.timeFormat"] = this.form.timeFormat;
        dataParam["paramTimes.customizeFormat"] = this.form.customizeFormat;
      }

      if (this.isShowElement.formalTypeShow) {
        dataParam["paramChoice.choiceType"] = this.form.formalType;
      }
      if (this.isShowElement.SQLdtreeShow) {
        dataParam["paramChoice.optionsSql"] = this.form.paramChoice.optionsSql;
      }
      if (this.isShowElement.alternateValueShow) {
        if (this.activeName === "SQL") {
          dataParam["paramChoice.optionsSql"] =
            this.form.paramChoice.optionsSqlLine;
        }
        if (this.activeName === "custom") {
          var names = [];
          var value = [];
          this.customStaticValues.push(this.defaultExistsCustomStaticValues);
          for (let i = 0; i < this.customStaticValues.length; i++) {
            names.push(this.customStaticValues[i].names);
            value.push(this.customStaticValues[i].values);
          }
          dataParam["paramOptions.optionsNames"] = names.join("-");
          dataParam["paramOptions.optionsVals"] = value.join("-");
        }
      }
      $.ajax({
        url: this.analysisUrl + "/paramController/addParam",
        method: "POST",
        cache: false,
        dataType: "json",
        data: dataParam,
        async: false,
        success: function (data, textStatus, jqXHR) {
          if (data.code == 0) {
            that.$emit("refshParamList");
          } else {
            that.$message({
              type: "error",
              message: "程序发生异常，请联系管理员!",
            });
          }
        },
        error: function () {
          that.$message({
            type: "error",
            message: "程序发生异常，请联系管理员!",
          });
        },
      });
    },
    /**
     *修改参数
     */
    updateParam() {
      let that = this;
      var paramName = this.form.paramName;
      var dataType = this.form.dataType;
      var inputType = this.form.inputType;
      var example = this.form.example;
      var dataLength = this.form.dataLength;
      var ammParamTypeUuid = this.form.paramName;
      var description = this.form.description;
      var folderId = this.form.folderId;
      var allowedNull = this.form.allowedNull;
      var paramUuid = this.updateParamObj.ammParamUuid;
      var dataParam = {
        "param.ammParamUuid": paramUuid,
        "param.paramName": paramName,
        "param.dataType": dataType,
        "param.inputType": inputType,
        "param.example": example,
        "param.dataLength": dataLength,
        "param.description": description,
        "param.ammParamTypeUuid": ammParamTypeUuid,
        "paramChoice.allowedNull": allowedNull,
        "param.signForSql": this.tabsigns,
        "param.paramFolderUuid": folderId,
      };
      if (paramName === "") {
        this.$message({ type: "info", message: "参数名不能为空!" });
        return;
      } else if (dataType === "") {
        this.$message({ type: "info", message: "数据类型不能为空!" });
        return;
      } else if (inputType === "") {
        this.$message({ type: "info", message: "输入类型不能为空!" });
        return;
      } else if (example === "") {
        this.$message({ type: "info", message: "示例不能为空!" });
        return;
      }

      if (this.isShowElement.timeIntervalShow) {
        dataParam["paramTimes.maxIntervalUnit"] = $("#maxIntervalUnit").val();
        dataParam["paramTimes.maxIntervalVal"] = $("#maxIntervalVal").val();
        dataParam["paramTimes.ammParamTimesUuid"] = $("#timesUuid").val();
      }
      //新增时间格式
      if (this.isShowElement.dateFormatTag) {
        dataParam["paramTimes.ammParamTimesUuid"] = $("#timesUuid").val();
        dataParam["paramTimes.timeFormat"] = this.form.timeFormat;
        dataParam["paramTimes.customizeFormat"] = this.form.customizeFormat;
      }

      if (this.isShowElement.formalTypeShow) {
        dataParam["paramChoice.choiceType"] = this.form.formalType;
      }
      if (this.isShowElement.SQLdtreeShow) {
        dataParam["paramChoice.optionsSql"] = this.form.paramChoice.optionsSql;
      }
      if (this.isShowElement.alternateValueShow) {
        if (this.activeName === "SQL") {
          dataParam["paramChoice.optionsSql"] =
            this.form.paramChoice.optionsSqlLine;
        }
        if (this.activeName === "custom") {
          var names = [];
          var value = [];
          var uuids = [];
          this.customStaticValues.push(this.defaultExistsCustomStaticValues);
          for (let i = 0; i < this.customStaticValues.length; i++) {
            names.push(this.customStaticValues[i].names);
            value.push(this.customStaticValues[i].values);
            uuids.push(this.customStaticValues[i].uuid);
          }
          dataParam["paramOptions.optionsNames"] = names.join("-");
          dataParam["paramOptions.optionsVals"] = value.join("-");
          dataParam["paramOptions.optionsUuids"] = uuids.join("-");
        }
        dataParam["paramChoice.ammParamChoiceUuid"] = $("#choiceUuid").val();
      }
      $.ajax({
        url: this.analysisUrl + "/paramController/editParam",
        method: "POST",
        cache: false,
        dataType: "json",
        data: dataParam,
        async: false,
        success: function (data, textStatus, jqXHR) {
          if (data.code == 0) {
            that.$emit("refshParamList");
          } else {
            that.$message({
              type: "error",
              message: "程序发生异常，请联系管理员!",
            });
          }
        },
        error: function () {
          that.$message({
            type: "error",
            message: "程序发生异常，请联系管理员!",
          });
        },
      });
    },
    /**
     * sql预览
     * @param type 1、SQL列表  2、树
     */
    sqlPreview(type) {
      var sql = "";
      if (type == 1) {
        sql = $("#optionsSqlline").val();
      } else {
        //type==2
        sql = $("#optionsSql").val();
      }
      this.seeDataSql = sql;
      this.seeSqlDataDialog = true;
    },
    /**
     * 查看sql规则
     * @param type 1列表 2树
     */
    viewSqlRule(type) {
      this.SQLRuleDialog = true;
      this.SQLRuleText = this.getSqlRule(type);
    },
    /**
     * 获取sql规则
     * @param type 1列表 2树
     */
    getSqlRule(type) {
      let sqlRule = "";
      switch (type) {
        case 1:
          sqlRule = this.sqlRulesDesc.list;
          break;
        case 2:
          sqlRule = this.sqlRulesDesc.tree;
          break;
        default:
          break;
      }
      return sqlRule;
    },
  },
};
</script>
