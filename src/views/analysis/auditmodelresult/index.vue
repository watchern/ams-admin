<template>
  <!-- index.vue是最外层的父页签组件，把firstParentTabCon.vue挂载进来作为第一个页签中的内容 -->
  <div class="result-tabs-div">
    <el-tabs
      @tab-click="handleClick"
      v-model="editableTabsValue"
      type="card"
      closable
      @tab-remove="removeTab"
    >
      <!-- 加一个固定页签 -->
      <el-tab-pane
        name="模型结果列表"
        label="模型结果列表"
        style="height:100%"
      ><firstParentTabCon @addtab="addTab" /></el-tab-pane>
      <el-tab-pane
        v-for="item in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
        class="result-tabs"
      >
        <!-- 新页签中页签组件 -->
        <!-- <div v-html="item.content"></div> -->
        <childTabs
          ref="childtabsref"
          :maintable="item.mainTable"
          :helptables="item.helpTables"
          :model-uuid="item.modeluuid"
          :modelTitle="item.title"
          :resultSpiltObjects="item.resultSpiltObjects"
          :useType="item.useType===undefined?'modelRunResult':item.useType"
          :pre-value="item.currentExecuteSQL"
          @addTab="addTab"
          @setNextValue="setNextValue"
          :model-id="item.modelId"
          :modelType="item.modelType"
          :result-mark="item.currentExecuteSQL===undefined?'modelResult':'modelPreview'"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import firstParentTabCon from '@/views/analysis/auditmodelresult/firstparenttabcon'
import childTabs from '@/views/analysis/auditmodelresult/childtabs'
import { getOneDict } from "@/utils/index";
export default {
  components: {
    firstParentTabCon,
    childTabs
  },
  data() {
    return {
      editableTabsValue: '模型结果列表', //第一个大页签的名称
      editableTabs: [], //存放每一个页签对象
      tabIndex: 0, //语句记录页签个数
      mainTable: {}, //运行结果表主表对象
      helpTables: [], //运行结果表附表数组
    }
  },
  methods: {
    handleClick(tab, event){
      if (tab.name!=='模型结果列表'){
        tab.$children[0].clickBigTab()
      }
    },
    /**
     * 添加页签方法
     * resultTable:辅表（运行结果表）数组
     * mainTable:主表（运行结果表对象）
     * modelname:模型的名称，用来给新页签赋值title属性用
     */
    addTab(resultTable, mainTable, modelname, modelUuid,resultSpiltObjects,usetype,currentExecuteSQL, selectRow) {
      const newTabName = ++this.tabIndex + ''
      this.mainTable = mainTable
      this.helpTables = resultTable
      this.editableTabs.push({
        title: modelname + '模型结果',
        name: newTabName,
        mainTable: mainTable,
        helpTables: resultTable,
        modeluuid: modelUuid,
        resultSpiltObjects: resultSpiltObjects,
        useType: usetype,
        currentExecuteSQL: currentExecuteSQL,
        modelId: modelUuid,
        modelType: this.getModelType(this.modelTypeFormatter({modelType: selectRow.model.modelType}))
      })
      this.editableTabsValue = newTabName
    },
    modelTypeFormatter(row, column) {
      const modelType = row.modelType;
      const dicObj = getOneDict(modelType);
      let value = "";
      if (dicObj.length == 0) {
        return "";
      }
      value = dicObj[0].codeName;
      return value;
    },
    getModelType (name) {
      if(name == 'SQL模型') {
        return 'sql'
      } else if (name == '图形化模型') {
        return 'graph'
      } else {
        return name
      }
    },
    setNextValue(val){
      this.$refs.childtabsref[this.editableTabs.length-1].loadTableData(val,'apple')
    },
    // 删除页签方法
    removeTab(targetName) {
      const tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            } else {
              activeName = '模型结果列表'
            }
          }
        })
      }

      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter((tab) => tab.name !== targetName)
    }
  }
}
</script>
<style scoped>
>>>.el-tabs__item{
    height:32px!important;
    line-height:32px!important;
}
>>>.el-tabs__content{
  height: calc(100% - 25px);
  overflow: auto;
  padding:0px!important;
}
>>>.el-tabs--card{
  height:100%
}
.result-tabs-div{
  height:100%;
  padding-bottom: 20px;
}
.result-tabs{
  height:100%
}
</style>

