<template>
  <!-- childTabs是子页签组件 -->
  <el-tabs type="border-card" class="child-taps-top">
    <el-tab-pane v-if="useType==='modelRunResult'?true:false" style="height:calc(100% - 60px)" :label="useType === 'modelRunResult' ? '主表' : '结果1'"
      ><childTabCons
        :settingInfo="settingInfo"
        :nowtable="maintable"
        :model-uuid="modelUuid"
        :useType="useType"
        :resultSpiltObjects="resultSpiltObjects"
        :modelId="modelId"
        :myIndex='1'
        :preLength="1"
        @addBigTabs="addBigTabs"
        @setNextValue="setNextValue"
        @saveModelResult="saveModelResult"
        ref="onlyChild"
    /></el-tab-pane>
    <el-tab-pane
      v-for="(item, key) in useType==='modelRunResult'?helptables:preValue"
      :key="key"
      :label="tabsName(key)"
      class="result-tabs"
      :style="useType==='previewTable'?'height:500px':''"
      ><childTabCons
        ref="child"
        :is-model-preview="isModelPreview"
        @addBigTabsModelPreview="addBigTabsModelPreview"
        @addBigTabs="addBigTabs"
        @setNextValue="setNextValue"
        @saveModelResult="saveModelResult"
        :chartModelUuid="chartModelUuid"
        :resultSpiltObjects="resultSpiltObjects"
        :modelId="modelId"
        :nowtable="item"
        :prePersonalVal="item"
        :useType="useType"
        :preLength="useType=='sqlEditor'||useType=='modelPreview'?preValue.length:1"
        :myIndex="useType=='sqlEditor'||useType=='modelPreview'?key:1"/>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import childTabCons from "@/views/analysis/auditmodelresult/childtabcon";
import { now } from "moment";
import {addRunTaskAndRunTaskRel, deleteModel, uuid2} from "@/api/analysis/auditmodel";
import {deleteGraphInfoById} from "@/api/graphtool/apiJs/graphList";
export default {
  components: {
    'childTabCons':childTabCons
  },
  data() {
    return {
      index:0,
      hasButton:false,
      paramInfoCopy:{}
    };
  },
  mounted() {
    this.paramInfoCopy = this.paramInfo
  },
  methods: {
    /**
     * sql编辑器模型结果用来给子组件aggrid表格赋值
     */
      loadTableData(nextValue,modelName){
        this.$refs.child[this.index].initData(null,nextValue,modelName)
        this.index++;
      },
      /**
       * sql编辑器模型结果用于给子组件aggrid表格加遮罩
       */
      reSetTable(){
        for(var i = 0;i<this.preValue.length;i++){
          this.$refs.child[i].reSet1()
        }
        this.index = 0
      },
      tabsName(key){
        if(this.useType==='modelRunResult'){
          return '辅表' + (key + 1)
        }else if(this.useType==='sqlEditor'||this.useType==='modelPreview'){
          if(this.preValue.length === key + 1){
            return '主表'
          }
          else{
            return '辅助' + (key + 1)
          }
        }else if(this.useType==='previewTable'){
            return '数据详情'
        }else if(this.useType==='graph'){
          return this.preValue[key].name
        }
      },
    addBigTabs(resultTable,mainTable,modelname,modelUuid,resultSpiltObjects,useType,currentExecuteSQL){
        this.$emit('addTab',undefined,undefined,modelname,modelUuid,undefined,useType,currentExecuteSQL)
    },
    addBigTabsModelPreview(modelName,modelUuid,currentExecuteSQL){
      var modelObj = {modelName:modelName,modelUuid:modelUuid}
      this.$emit('addTab',modelObj,false,currentExecuteSQL,true)
    },
    setNextValue(val){
      this.$emit('setNextValue',val)
    },
    clickBigTab(){
        if (this.resultMark==='modelResult'){
          this.$refs.onlyChild.clickBigTab()
        }else{
          this.$refs.child[this.index-1].clickBigTab()
        }
    },
    loadNewParamInfo(paramInfo){
      this.paramInfoCopy = paramInfo
    },
    saveModelResult(){
      var runTaskUuid = uuid2();
      var batchUuid = uuid2();
      var runTaskRels = [];
      var runTaskRelUuid = uuid2();
      var runTaskRel = {
        runTaskRelUuid: runTaskRelUuid,
        runTaskUuid: runTaskUuid,
        sourceUuid: this.modelId,
        settingInfo: JSON.stringify(this.paramInfoCopy),
        modelVersion: 1,
        runRecourceType: 1,
        isDeleted: 0,
        runStatus: 1,
      };
      runTaskRels.push(runTaskRel);
      var runTask = {
        runTaskUuid: runTaskUuid,
        batchUuid: batchUuid,
        runTaskName: "系统添加",
        runType: 3,
        timingExecute: "",
        //locationUuid: modelResultSavePathId,
        runTaskRels: runTaskRels
      };
      addRunTaskAndRunTaskRel(runTask).then((resp) => {
        if (resp.data == true) {
          this.$notify({
            title: "提示",
            message: "已经将模型添加到后台自动执行，请去'模型结果'查看",
            type: "success",
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          this.$message({ type: "info", message: "执行运行任务失败" });
        }
      });
    }
  },
  /**
   * SQL编辑器结果、模型结果界面使用变量：preValue:先传过来的值，用于判断加几个页签  nextValue：后传过来的数据表
   * 模型运行结果使用变量：maintable：运行结果表主表对象   helptables：运行结果表附表对象数组   modelUuid：点击模型结果名称模型的uuid
   * 公用变量：useType：判断是SQL编辑器结果、模型结果界面还是模型运行结果界面
   */
  props: [
    "maintable",
    "helptables",
    "modelUuid",
    "useType",
    "preValue",
    "resultSpiltObjects",
    "modelId",
    "chartModelUuid",
    "settingInfo",
    "resultMark",
    "isModelPreview",
    "isRelation",
    "paramInfo"
  ],
};
</script>
<style scoped>
>>>.el-tabs__item{
    height:32px!important;
    line-height:32px!important;
}
>>>.el-tabs__content{
  height: calc(100% - 31px);
  overflow-y: auto!important;
  padding:0px!important;
}
.result-tabs{
  height:100%
}
.child-taps-top{
  height:100%
}
</style>
