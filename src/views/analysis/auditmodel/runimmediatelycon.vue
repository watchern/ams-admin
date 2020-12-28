<template>
  <div id="fatherDiv">
    <el-container>
      <el-aside width="20%">
        <div v-for="(item, key) in this.detailModels" :key="key">
          <el-tooltip class="item" effect="light" placement="right">
            <div slot="content">
              审计事项 : {{ item.auditItemName }}<br />风险等级 :
              {{ afterTranscod[key] }}<br />审计思路 : {{ item.auditIdeas }}
            </div>
            <el-button class="tipButton">{{ item.modelName }}</el-button>
          </el-tooltip>
        </div>
      </el-aside>
      <el-container>
        <el-header>
          <div>
            <div v-if="timing">
              <span class="demonstration">运行日期时间 ：</span>
              <el-date-picker
                v-model="dateTime"
                type="datetime"
                placeholder="选择日期时间"
                :picker-options="executeTimeOptions"
              >
              </el-date-picker>
            </div>
            <label style="margin-right: -43px;color:#9B4C4C;margin-left: 10px;margin-left: 15px;cursor: pointer;" @click="modelResultSavePathDialog = true">{{ path }}</label>
<!--            <a @click="modelResultSavePathDialog = true" style="color: #409eff"
              >编辑</a
            >-->
          </div>
        </el-header>
        <el-main>
          <div v-for="(item, key) in this.detailModels" :key="key">
            <paramDraw
              :myId="item.modelUuid + '2'"
              ref="paramassembly"
            ></paramDraw>
          </div>
          <el-dialog
            title="选择模型结果保存路径"
            :visible.sync="modelResultSavePathDialog"
            width="30%"
            :append-to-body="true"
          >
            <data-tree
              :data-user-id="personCode"
              :scene-code="sceneCode"
              :tree-type="treeType"
              @node-click="handleClick"
              style="height: 500px;overflow-y: scroll"
            />
            <span slot="footer" class="dialog-footer">
              <el-button @click="modelResultSavePathDialog = false"
                >取 消</el-button
              >
              <el-button type="primary" @click="modelResultSavePathDetermine"
                >确 定</el-button
              >
            </span>
          </el-dialog>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import paramDraw from "@/views/analysis/modelparam/paramdraw";
import { findModelList } from "@/api/analysis/auditmodel";
import { replaceNodeParam } from "@/api/analysis/auditparam";
import { getOneDict } from "@/utils/index";
import dataTree from "@/views/data/role-res/data-tree";
export default {
  watch: {
    detailModels(value) {
      this.$nextTick(function () {
        this.creatParamWindow();
      });
    },
  },
  created() {
    this.initDialog();
    this.tempPath = "根路径";
    this.tempId = this.$store.getters.datauserid
    this.modelResultSavePathId = this.$store.getters.datauserid
    this.path = "当前执行模型保存路径:根路径"
  },
  components: {
    paramDraw,
    dataTree,
  },
  data() {
    return {
      modelIds: [], //选中模型的id数组
      detailModels: [], //查出来详细的model数组
      afterTranscod: [], //按顺序存储转码后的风险等级
      dateTime: "",
      //单次/多次/周期执行的周期开始结束时间 执行时间选择配置
      executeTimeOptions: {
        disabledDate(time) {
          //不能选择小于当前日志的事件
          return (
            new Date(time.toLocaleDateString()) <
            new Date(new Date().toLocaleDateString())
          );
        },
      },
      modelResultSavePathDialog: false,
      personCode: this.$store.state.user.code,
      sceneCode: "auditor",
      treeType: "save",
      path: "",
      modelResultSavePathId: '',
      tempPath: "",
      nodeType: "",
      tempId: "",
    };
  },
  props: ["models", "timing"],
  methods: {
    /**
     * 初始化dialog
     */
    initDialog() {
      for (var i = 0; i < this.models.length; i++) {
        this.modelIds.push(this.models[i].modelUuid);
      }
      findModelList(this.modelIds).then((resp) => {
        this.detailModels = resp.data;
        this.findRiskLevelCode();
      });
    },
    /**
     * 渲染参数界面
     */
    creatParamWindow() {
      for (var i = 0; i < this.detailModels.length; i++) {
        var paramArr = [];
        if (this.detailModels[i].parammModelRel.length > 0) {
          for (var j = 0; j < this.detailModels[i].parammModelRel.length; j++) {
            paramArr.push(
              JSON.parse(this.detailModels[i].parammModelRel[j].paramValue)
            );
          }
        }
        let sql = "";
        if(this.detailModels[i].modelType == "002003001"){
          sql = this.detailModels[i].sqlValue
        }
        if(this.detailModels[i].modelType == "002003002"){
          sql = this.detailModels[i].modelSql
        }
        this.$refs.paramassembly[i].initParamHtmlSS(
          sql, paramArr,
          this.detailModels[i].modelName + "参数",
          this.detailModels[i].modelUuid + "2",
          this.detailModels[i].modelUuid + "2"
        );
      }
    },
    /**
     * 点击dialog确定按钮返回的替换好的sql和paramArr
     */
    replaceParams() {
      var replaceInfo = [];
      for (var i = 0; i < this.detailModels.length; i++) {
        replaceInfo.push(
          replaceNodeParam(this.detailModels[i].modelUuid + "2",this.detailModels[i].modelUuid + "2")
        );
      }
      var obj = {
        dateTime: this.dateTime,
        models: this.detailModels,
        replaceInfo: replaceInfo,
        modelResultSavePathId: this.modelResultSavePathId
      };
      return obj;
    },
    /**
     * 存储转码后的风险等级
     */
    findRiskLevelCode() {
      for (var i = 0; i < this.detailModels.length; i++) {
        let dicObj = getOneDict(this.detailModels[i].riskLevelUuid);
        this.afterTranscod.push(dicObj[0].codeName);
      }
    },
    handleClick(data, node, tree) {
      this.tempPath = data.label;
      this.tempId = data.id;
      this.nodeType = data.type;
    },
    modelResultSavePathDetermine() {
      if (this.nodeType == "folder") {
        this.path = "当前执行模型保存路径:" + this.tempPath;
        this.modelResultSavePathId = this.tempId;
        this.modelResultSavePathDialog = false;
      } else if(this.nodeType == ""){
        this.$message('请选择路径');
      }else{
        this.$message('只能选择文件夹');
      }
    },
  },
};
</script>
<style>
#fatherDiv .tipButton {
  border: 1px solid #000;
  margin-bottom: 5px;
}
</style>
