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
          <th align="center">操作</th>
        </tr>
        </thead>
        <tbody ref="setParamTbody" class="drag-tbody">
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
          <td class="option-btn" ref="dragBtn"><i class="el-icon-top" title="上移" @click="upMove(index)"></i><i class="el-icon-bottom" title="下移" @click="downMove(index)"></i></td>
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
    refresh: true,
    paramListValueList: [], // 下拉列表参数值集合
    paramTreeValueList: [], // 下拉树列表参数值集合
    selectNum:0,// 用于临时记录参数为下拉列表的个数
    selectTreeNum:0,// 用于临时记录参数为下拉树的个数
    fromIndex: 0,
		toIndex: 0,
  }
},
  mounted(){
    settingParams.sendSettingVue(this)
    // this.$nextTick(() => {
    //   this.rowDrop()
    // })
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
    },
    getParamsSetting(){
      if(this.paramsSetting == null){
        return
      }
      return settingParams.getParamsSettingBySave()
    },
     //行拖拽
    rowDrop() {
      // const tbody = this.$refs.dragTable.querySelectorAll('tbody') // 元素选择器名称根据实际内容替换
      const tbody = document.querySelector(".drag-table tbody");
      const _this = this
      Sortable.create(tbody, {
        // sort: true,
        // // fallbackClass: true,
        // // handle: '.option-btn', //指定哪个类名的可以拖动
        // animation: 150,
        // ghostClass: "blue-background-class",
        // //handle: '.ant-table-tbody', //使用这个类名则是整行任意位置都可以拖动
        // //chosenClass: 'sortable-ghost',被选中项的css 类名
        // //dragClass: 'sortable-drag',正在被拖拽中的css类名
        // // group: { name: 'name', pull: true, put: true },
        onEnd({ newIndex, oldIndex }) {
          console.log(newIndex, oldIndex,'拖动完毕')
          const currRow = _this.tableData.splice(oldIndex, 1)[0]
          _this.tableData.splice(newIndex, 0, currRow)
        },
      })
    },
    upMove (index) {
      if (index > 0) {
        this.swapArray(this.setParamArr, index-1, index);
      } else {
        this.$message.warning("已经是第一条，不可上移！");
      }
    },
    downMove (index) {
      if ((index + 1) === this.setParamArr.length){
        this.$message.warning("已经是最后一条，不可下移！");
      } else {
        this.swapArray(this.setParamArr, index, index+1);
      } 
    },
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
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
  width: 20px;
  height: 20px;
  background: #bebebe;
  border-radius: 50%;
  line-height: 20px;
  text-align: center;
  margin-left: 5px;
  color: #fff;
  color: #f2f7fd;
}
</style>
