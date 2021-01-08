<template>
  <!-- childTabs是子页签组件 -->
  <el-tabs type="border-card" style="border:0;box-shadow:0 0 0 0 #000">
    <el-tab-pane v-if="useType==='modelRunResult'?true:false"  :label="useType === 'modelRunResult' ? '主表' : '结果1'"
      ><childTabCons
        :nowtable="maintable"
        :model-uuid="modelUuid"
        :useType="useType"
        :resultSpiltObjects="resultSpiltObjects"
        :modelId="modelId"
        :myIndex='1'
        :preLength="1"
    /></el-tab-pane>
    <el-tab-pane
      v-for="(item, key) in useType==='modelRunResult'?helptables:preValue"
      :key="key"
      :label="tabsName(key)"
      class="qweqwe"
      ><childTabCons ref="child" :chartModelUuid="chartModelUuid" :resultSpiltObjects="resultSpiltObjects" :modelId="modelId" :nowtable="item" :prePersonalVal="item" :useType="useType" :preLength="useType=='sqlEditor'||useType=='modelPreview'?preValue.length:1" :myIndex="useType=='sqlEditor'||useType=='modelPreview'?key:1"/>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import childTabCons from "@/views/analysis/auditmodelresult/childtabcon";
import { now } from "moment";
export default {
  components: {
    'childTabCons':childTabCons
  },
  data() {
    return {
      index:0,
      hasButton:false
    };
  },
  methods: {
    /**
     * sql编辑器模型结果用来给子组件aggrid表格赋值
     */
      loadTableData(nextValue){
        this.$refs.child[this.index].initData(null,nextValue)
        this.
          index++;
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
    "chartModelUuid"
  ],
};
</script>
