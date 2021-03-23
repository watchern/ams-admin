<template>
  <el-table
    :data="tableData"
    height="400px"
    style="width: 100%">
    <div v-for="(value,i) in columnData">
      <el-table-column
        :prop="value.columnName"
        :label="value.columnName"
        width="200">
      </el-table-column>
    </div>
  </el-table>
</template>
<script>
import $ from 'jquery'
import {Loading} from "element-ui";
export default {
  props:['seeDataSql'],
  mounted() {
    let loadingInstance = Loading.service({fullscreen: true,text:"正在读取数据,请稍候..."});
    var that = this
    var url = this.contextUrl + "/InCalculationColumn/seeSqlData";
    $.ajax({
      type: "post",
      url: url,
      data: {sql:this.seeDataSql},
      async: true,
      dataType: "json",
      success: function (res) {
        loadingInstance.close()
        if(res.result.state == false){
          that.$message({info:"error",message:"数据读取出错!"})
        }
        else{
          that.columnData = res.result.columnInfo.columnList
          that.tableData = res.result.result
        }
      },
      error:function(res){
        loadingInstance.close()
        that.$message({info:"error",message:"数据读取出错!"})
      }
    });
    //调用后台查出数据然后绑定
  },
  data() {
    return {
      tableData: [],
      columnData:[]
    }
  }
}
</script>
