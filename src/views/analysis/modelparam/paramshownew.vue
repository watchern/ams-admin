<template>
  <div id="setParam" ref="settingParamDiv">
<!--    <div class="col-sm-10">-->
    <el-row>
      <table id="setParamTable" class="table table-bordered detail-form drag-table" :key="refresh" ref="dragTable">
        <thead>
        <tr>
          <th align="center" width="200px">参数名称</th>
          <th align="center" width="300px">默认值设置</th>
          <th align="center">参数说明</th>
          <th align="center" style="text-align: center;">操作</th>
        </tr>
        </thead>
        <tbody ref="setParamTbody" class="drag-tbody">
        <tr ref="setParamTr" v-if="setParamArr.length == 0">
          <td align="center"></td>
          <td align="left"><span style="padding-left: 61px;">暂无数据</span></td>
          <td align="center"></td>
        </tr>
        <tr ref="setParamTr" v-for="(setParamObj,index) in setParamArr" :index="index" :class="setParamObj.sortId" :key="index">
          <td align="center">{{setParamObj.name}}</td>
          <td v-if="setParamObj.inputType === 'lineinp'" ref="selectParam">
            <!-- {{setParamObj.data.length}} -->
            <!-- <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div> -->

             <!-- 下拉列表类型 -->
             <!-- setParamObj.dataType == 'str' ? `'`+ item.value + `'`:  -->
            <el-select v-model="paramListValueList[index]" style="width: 90%;" 
                :multiple="setParamObj.dataChoiceType == 0 || setParamObj.dataChoiceType == '0'" filterable clearable @change="changeRelationParam(index, paramListValueList[index], setParamObj.dataType)" @click.native="changeparamdata(setParamObj,index)">
              <el-option v-for="(item, index) in setParamObj.data" :value="item.value" :label="item.name" :key="index" >
                <span style="float: left"> {{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value == item.name ? "" : item.value}}  &nbsp;&nbsp;&nbsp;&nbsp;</span>
              </el-option>
            </el-select>
          </td>
          <td v-if="setParamObj.inputType === 'textinp'" ref="textParam">
            <el-input style="width: 90%;" :title="setParamObj.title" class='paramOption paramTr' v-model="setParamObj.value" @change="changeRelationParam(index, setParamObj.value)" @click.native="changeparamdata(setParamObj,index)" clearable></el-input>
          </td>
          <td v-if="setParamObj.inputType === 'timeinp'" ref="dataParam">
            <!-- <el-date-picker style="width: 90%;" :title="setParamObj.title" class='paramOption paramTr' type="date" placeholder="选择日期" :value-format="timeDealFormat(setParamObj.timeFormat)"  v-model="setParamObj.value" @change="changeRelationParam(index, setParamObj.value)" @click.native="changeparamdata(setParamObj,index)"></el-date-picker> -->
            <el-date-picker v-if="setParamObj.timeFormat!='other'" ref="paramOption" :index="index"  :title="setParamObj.title" :type="setParamObj.timeFormat" placeholder="选择日期" :value-format="timeDealFormat(setParamObj.timeFormat)"  v-model="setParamObj.value" style="width: 98%;" @change="changeRelationParam(index, setParamObj.value)" @click.native="changeparamdata(setParamObj,index)"></el-date-picker> 
           
            <el-date-picker v-else ref="paramOption" :index="index"  :title="setParamObj.title" type="date" placeholder="选择日期" :value-format="setParamObj.customizeFormat" v-model="setParamObj.value" style="width: 98%;" @change="changeRelationParam(index, setParamObj.value)" @click.native="changeparamdata(setParamObj,index)"></el-date-picker> 
          </td>
          <td v-if="setParamObj.inputType === 'treeinp'" ref="selectTreeParam">
            <!-- <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div> -->
            <el-cascader
            v-model="paramTreeValueList[index]"
            style="width:90%"
            :props="{ label:'name',  multiple: setParamObj.dataChoiceType == 0 || setParamObj.dataChoiceType == '0', emitPath: false, checkStrictly: true }"
            :options="setParamObj.data"
            @change="changeRelationParam(index, paramTreeValueList[index])"
            @click.native="changeparamdata(setParamObj,index)"
            multiple
            clearable />
          </td>
          <td>{{setParamObj.description}}</td>
          <td class="option-btn" ref="dragBtn"><i class="fa fa-bars drag-dom" title="拖动"></i></td>
          <!-- <td class="option-btn" ref="dragBtn"><el-button class="drag-dom" size="mini">拖动</el-button></td> -->
          
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
import Sortable from "sortablejs";
export default {
name: "paramshownew",
data(){
  return{
    load:null,
    arr:[],
    setParamArr :[],
    paramsSetting:[],
    refresh: true,
    paramListValueList: [], // 下拉列表参数值集合
    paramTreeValueList: [], // 下拉树列表参数值集合
    selectNum:0,// 用于临时记录参数为下拉列表的个数
    selectTreeNum:0,// 用于临时记录参数为下拉树的个数
    setParamArrIdArr: [], // 拖拽后的id数组
  }
},
  mounted(){
    settingParams.sendSettingVue(this)
  },
  methods:{
    changeparamdata (info,ind) {
      settingParams.changeparamdata(info,ind);
    },
    async changeRelationParam(ind, val, dataType){
      settingParams.changeRelationParam(ind, val, dataType);
    },
    //处理时间格式
    timeDealFormat (val) {
      if(val=="year"){
        return "yyyy";
      }else if(val=="month"){
        return "yyyy-MM";
      }else{
        return "yyyy-MM-dd";
      }
    },
    initSetting(paramsSetting){
      this.paramsSetting = paramsSetting
      this.arr = paramsSetting
      settingParams.initSettingParam()
    },
    // 清空参数
    removeParam(){
      this.setParamArr = []
      this.paramsSetting = null
    },
    refreshTable(){
      // key值刷新页面
      this.refresh = !this.refresh
      this.$nextTick(() => {
        // 表格加载完成执行拖拽事件
        if (this.$refs.dragTable) {
          this.rowDrop();
        }
      })
    },
    getParamsSetting(){
      if(this.paramsSetting == null){
        return
      }
      return settingParams.getParamsSettingBySave()
    },
    //行拖拽
    rowDrop() {
     
      // const tbody = document.querySelector("#setParamTable .drag-tbody");
      const tbody = this.$refs.setParamTbody; 
      const self = this;
      Sortable.create(tbody, {
        handle: ".option-btn .drag-dom",
        // sort: true,
        animation: 150,
        onEnd(evt) {
          if (evt.newIndex != evt.oldIndex) {
            self.setParamArrIdArr = []
            Array.from(evt.to.rows).forEach(item => {
              self.setParamArrIdArr.push(item.getAttribute('class'))
            })
          }
        },
      })
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
.option-btn {
  text-align: center;
  cursor: pointer;
  vertical-align: middle;
}
.option-btn i {
  display: inline-block;
  width: 35px;
  height: 20px;
  /* border-radius: 50%; */
  line-height: 20px;
  text-align: center;
  margin-left: 5px;
  color: #fff;
  color: #f2f7fd;
  background: #559ed4 !important;
  border-radius: 2px;
}
</style>
