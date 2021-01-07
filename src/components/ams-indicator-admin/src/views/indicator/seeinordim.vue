<template>
  <div>
      <div v-show="isShowDim">
        <el-table
          :data="tableDimData"
          style="width:100%;height: 400px;overflow-y:scroll">
          <el-table-column
            prop="dimensionName"
            label="维度名称"
            width="180">
          </el-table-column>
          <el-table-column
            prop="columnName"
            label="关联列"
            width="180">
          </el-table-column>
          <el-table-column
            prop="tableName"
            label="来源表">
          </el-table-column>
        </el-table>
      </div>
      <div v-show="isShowIn">
        <el-table
          :data="tableInData"
          style="width:100%;height: 400px;overflow-y:scroll">
          <el-table-column
            prop="measureName"
            label="指标名称"
            width="180">
          </el-table-column>
          <el-table-column
            prop="measureTypeCN"
            label="指标类型"
            width="180">
          </el-table-column>
          <el-table-column
            prop="tableName"
            label="来源表"
            width="300">
          </el-table-column>
          <el-table-column
            prop="columnName"
            label="关联列"
            width="180">
          </el-table-column>
          <el-table-column
            prop="measureGroup"
            label="聚合方式"
            width="180">
          </el-table-column>
          <el-table-column
            prop="createPersonName"
            label="创建人"
            width="180">
          </el-table-column>
          <el-table-column
            prop="measureMemo"
            label="指标说明"
            width="180"
            :formatter="selectDetail">
          </el-table-column>
        </el-table>
      </div>
  </div>
</template>
<script type="text/javascript">
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui'
export default {
  name: 'addDimension',
  props: ['type'],
  components: {

  },
  data() {
    return {
      isShowDim:false,
      isShowIn:false,
      tableDimData:[],
      tableInData:[]
    }
  },
  mounted() {
    if(this.type == 1){
      this.isShowIn = true
      this.getAllIn()
    }
    else{
      this.isShowDim = true
      this.getAllDim()
    }
  },
  created() {
  },
  methods: {
    selectDetail(row, column) {
      var newValueHtml = row.measureMemo;
      if(newValueHtml == undefined){
        return "无";
      }
      if(row.measureMemo.length>100){
        newValueHtml = "<span title='"+row.measureMemo+"'>"+row.measureMemo.substring(0,80)+"..."+"</span>";
      }
      return newValueHtml;
    },
    getAllDim(){
      let that = this
      var url = this.contextUrl + "/InDimension/getAllDimension";
      $.post(url,{},function (res) {
        if(res.isError == true){
          that.$message({type:"info",text:res.message})
          return
        }
        that.tableDimData = res.result
      },"json")
    },
    getAllIn(){
      let that = this
      var url = this.contextUrl + "/InMeasure/getAllInAndCal";
      $.post(url, {}, function (res) {
        if(res.isError == true){
          that.$message({type:"info",text:res.message})
          return
        }
        that.tableInData = res.result
      }, "json");
    }
  }
}
</script>



