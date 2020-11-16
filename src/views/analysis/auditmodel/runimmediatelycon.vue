<template>
  <div id="fatherDiv">
    <el-container>
      <el-aside width="35%">
        <div v-for="(item, key) in this.detailModels" :key="key">
        <el-tooltip
          class="item"
          effect="light"
          placement="right"
        >
          <div slot="content">审计事项 : {{item.auditItemName}}<br/>风险等级 : {{afterTranscod[key]}}<br/>审计思路 : {{item.auditIdeas}}</div>
          <el-button class="tipButton">{{ item.modelName }}</el-button>
        </el-tooltip>
        </div>
      </el-aside>
      <el-main>
        <div v-for="(item, key) in this.detailModels" :key="key">
          <paramDraw :myId="item.modelUuid" ref="paramassembly"></paramDraw>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import paramDraw from "@/views/analysis/modelparam/paramdraw";
import { findModelList } from "@/api/analysis/auditmodel";
import { replaceNodeParam } from "@/api/analysis/auditparam";
import { getOneDict } from '@/utils/index'
export default {
  watch: {
    detailModels(value) {
      this.$nextTick(function () {
        this.creatParamWindow();
      });
    },
  },
  created() {
    this.initDialog()
  },
  components: {
    paramDraw,
  },
  data() {
    return {
      modelIds: [], //选中模型的id数组
      detailModels: [], //查出来详细的model数组
      afterTranscod:[]  //按顺序存储转码后的风险等级
    };
  },
  props: ["models"],
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
        this.findRiskLevelCode()
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
        this.$refs.paramassembly[i].initParamHtmlSS(
          this.detailModels[i].sqlValue,
          paramArr,
          this.detailModels[i].modelName + "参数",
          this.detailModels[i].modelUuid
        );
      }
    },
    /**
     * 点击dialog确定按钮返回的替换好的sql和paramArr
     */
    replaceParams() {
      var replaceInfo = [];
      for (var i = 0; i < this.detailModels.length; i++) {
        replaceInfo.push(replaceNodeParam(this.detailModels[i].modelUuid));
      }
      var obj = {
        models: this.detailModels,
        replaceInfo: replaceInfo,
      };
      return obj;
    },
    /**
     * 存储转码后的风险等级
     */
    findRiskLevelCode(){
      for(var i =0;i<this.detailModels.length;i++){
          let dicObj = getOneDict(this.detailModels[i].riskLevelUuid)
          this.afterTranscod.push(dicObj[0].codeName)
      }
         
    }
  },
};
</script>
<style>
  #fatherDiv .tipButton{border: 1px solid #000;margin-bottom: 5px ;}
</style>
