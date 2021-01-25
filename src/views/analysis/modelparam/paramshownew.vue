<template>
  <div id="setParam" ref="settingParamDiv">
<!--    <div class="col-sm-10">-->
    <el-row>
      <span style="color: red;line-height: 35px;height: 30px;">注：可通过上下拖动行对参数进行排序设置</span>
      <table id="setParamTable" class="table table-bordered">
        <thead>
        <tr>
          <th align="center" width="200px">参数名称</th>
          <th align="center" width="300px">默认值设置</th>
          <th align="center">参数说明</th>
        </tr>
        </thead>
        <tbody ref="setParamTbody">
        <tr ref="setParamTr" v-for="(setParamObj,index) in setParamArr" :index="index">
          <td align="center">{{setParamObj.name}}</td>
          <td v-if="setParamObj.inputType === 'lineinp'" ref="selectParam">
            <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div>
          </td>
          <td v-if="setParamObj.inputType === 'textinp'" ref="textParam">
            <el-input :title="setParamObj.title" class='paramOption paramTr' v-model="setParamObj.value"></el-input>
          </td>
          <td v-if="setParamObj.inputType === 'timeinp'" ref="dataParam">
            <el-date-picker style="width: 100%;" :title="setParamObj.title" class='paramOption paramTr' type="date" placeholder="选择日期" v-model="setParamObj.value"></el-date-picker>
          </td>
          <td v-if="setParamObj.inputType === 'treeinp'" ref="selectTreeParam">
            <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div>
          </td>
          <td>{{setParamObj.description}}</td>
        </tr>
        </tbody>
      </table>
    </el-row>
<!--    </div>-->
  </div>
</template>

<script>
require('@/views/graphtool/tooldic/js/paramCommon.js')
require('@/components/ams-codemirror/addon/edit/matchbrackets.js')
require('@/components/ams-codemirror/mode/sql/sql.js')
require('@/components/ams-codemirror/addon/hint/sql-hint.js')
require('@/components/ams-codemirror/addon/hint/show-hint.js')
require('@/components/ams-codemirror/addon/wrap/hardwrap.js')
import {addJsFile, removeJcCssfile} from "@/api/analysis/common";
import * as settingParams from "@/api/analysis/auditparam";

export default {
name: "paramshownew",
  created(){
    addJsFile('/lib/layui/xm-select.js','xm-select')
  },
  beforeDestroy() {
    removeJcCssfile("xm-select.js","js")
  },
data(){
  return{
    arr:[],
    setParamArr :[],
    paramsSetting:[]
  }
},
  mounted(){
    settingParams.sendSettingVue(this)
  },
  methods:{
    initSetting(paramsSetting){
      this.paramsSetting = paramsSetting
      this.arr = paramsSetting
      settingParams.initSetting()
    },
    getParamsSetting(){
      return settingParams.getParamsSetting()
    }
  }

}
</script>
<style scoped src="@/components/ams-codemirror/lib/codemirror.css"></style>
<style scoped src="@/components/ams-codemirror/theme/idea.css"></style>
<style scoped src="@/components/ams-codemirror/addon/hint/show-hint.css"></style>
<style scoped src="@/components/ams-bootstrap/css/bootstrap.css"></style>
<style scoped src="@/components/ams-basic/css/accordion.css"></style>
<style scoped src="@/components/ams-basic/css/common.css"></style>
<style scoped type="text/css">
div#operators button{
  margin-left:5px;
}
div#operators p{
  color: red;
  word-wrap: break-word;
}
.paramBtn{
  background-color: #C9C5C5;
  padding:3px;
  border: 1px solid #C9C5C5;
  color: #1D7030;
  font-weight: 500;
}
.table > tbody > tr > td{
  font-size: 13px;
  color: #4B4B4B;
  line-height: 36px;
}
.table > thead > tr > th {
  background-color: #5886B2;
  color: #ECF0F5;
}
</style>
