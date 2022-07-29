<template>
  <el-table v-loading="loading"
    :data="tableData"
    height="400px"
    style="width: 100%">
      <el-table-column v-for="(value, index) in columnData" :key="index" :label="value.columnName" :prop="value.columnName" />
  </el-table>
</template>
<script>
import $ from 'jquery'
export default {
  props:['seeDataSql'],
  mounted() {
    this.pageNum = 1
    var that = this
    var url = this.analysisUrl + "/paramController/dywGetColumnList";
    this.loading = true
    $.ajax({
      type: "post",
      url: url,
      data: {
          sql:this.seeDataSql,
          pageSize:this.pageSize,
          pageNum:this.pageNum
      },
      async: true,
      dataType: "json",
      success: function (res) {
        that.loading = false
        if(res.data.verify == false){
          that.$message({info:"error",message:res.data.message})
        }
        else{
          that.columnData = res.data.result.columnInfo.columnList
          that.tableData = res.data.result.result
        }
      },
      error:function(res){
        that.$message({info:"error",message:"数据读取出错!"})
      }
    });
    //调用后台查出数据然后绑定
  },
  data() {
    return {
      tableData: [],
      columnData:[],
      analysisUrl: '/analysis',
      loading:false,
      pageSize:30,
      pageNum:1
    }
  },
    methods: {
        loadNewData() {
            this.pageNum = this.pageNum+1
            var that = this
            var url = this.analysisUrl + "/paramController/dywGetColumnList";
            this.loading = true
            $.ajax({
                type: "post",
                url: url,
                data: {
                    sql:this.seeDataSql,
                    pageSize:this.pageSize,
                    pageNum:this.pageNum
                },
                async: true,
                dataType: "json",
                success: function (res) {
                    that.loading = false
                    if(res.data.verify == false){
                        that.$message({info:"error",message:res.data.message})
                    }
                    else{
                        for (let i = 0 ;i < res.data.result.result.length;i++){
                            that.tableData.push(res.data.result.result[i])
                        }
                    }
                },
                error:function(res){
                    that.$message({info:"error",message:"数据读取出错!"})
                }
            });
        },
    }
}
</script>
