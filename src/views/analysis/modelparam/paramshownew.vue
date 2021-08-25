<template>
  <div id="setParam" ref="settingParamDiv">
<!--    <div class="col-sm-10">-->
    <el-row>
      <table id="setParamTable" class="table table-bordered detail-form" :key="refresh">
        <thead>
        <tr>
          <th align="center" width="200px">参数名称</th>
          <th align="center" width="300px">默认值设置</th>
          <th align="center">参数说明</th>
        </tr>
        </thead>
        <tbody ref="setParamTbody">
        <tr ref="setParamTr" v-if="setParamArr.length == 0">
          <td align="center"></td>
          <td align="left"><span style="padding-left: 61px;">暂无数据</span></td>
          <td align="center"></td>
        </tr>
        <tr ref="setParamTr" v-for="(setParamObj,index) in setParamArr" :index="index">
          <td align="center">{{setParamObj.name}}</td>
          <td v-if="setParamObj.inputType === 'lineinp'" ref="selectParam">
            <!-- {{setParamObj.data.length}} -->
            <!-- <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div> -->

             <!-- 下拉列表类型 -->
             <!-- setParamObj.dataType == 'str' ? `'`+ item.value + `'`:  -->
            <el-select v-model="setParamObj.value" style="width: 90%;" 
                :multiple="setParamObj.dataChoiceType == 0 || setParamObj.dataChoiceType == '0'" filterable clearable>
              <el-option v-for="item in setParamObj.data" :value="item.value" :label="item.name" :key="item.value" >
                <span style="float: left"> {{ item.value }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name}}  &nbsp;&nbsp;&nbsp;&nbsp;</span>
              </el-option>
            </el-select>
          </td>
          <td v-if="setParamObj.inputType === 'textinp'" ref="textParam">
            <el-input style="width: 90%;" :title="setParamObj.title" class='paramOption paramTr' v-model="setParamObj.value"></el-input>
          </td>
          <td v-if="setParamObj.inputType === 'timeinp'" ref="dataParam">
            <el-date-picker style="width: 90%;" :title="setParamObj.title" class='paramOption paramTr' type="date" placeholder="选择日期" v-model="setParamObj.value"></el-date-picker>
          </td>
          <td v-if="setParamObj.inputType === 'treeinp'" ref="selectTreeParam">
            <!-- <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div> -->
            <el-cascader
            v-model="setParamObj.value"
            style="width:90%"
            :props="{ label:'name',  multiple: setParamObj.dataChoiceType == 0 || setParamObj.dataChoiceType == '0', emitPath: false}"
            :options="setParamObj.data"
            multiple
            clearable />
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
import * as settingParams from "@/api/analysis/auditparam";
import '@/components/ams-loading/css/loading.css'
export default {
name: "paramshownew",
data(){
  return{
    load:null,
    arr:[],
    setParamArr :[],
    paramsSetting:[],
    refresh: true
  }
},
  mounted(){
    settingParams.sendSettingVue(this)
  },
  methods:{
    initSetting(paramsSetting){
      this.paramsSetting = paramsSetting
      this.arr = paramsSetting
      settingParams.initSettingParam()
    },
    // 清空参数
    removeParam(){
      this.setParamArr = []
    },
    refreshTable(){
      // key值刷新页面
       this.refresh = !this.refresh
    },
    getParamsSetting(){
      return settingParams.getParamsSettingBySave()
    }
  }

}
</script>
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
  background-color: #FFFFFF;
  color: #000000;
  font-size: 15px;
  width: 204px;
}
</style>
