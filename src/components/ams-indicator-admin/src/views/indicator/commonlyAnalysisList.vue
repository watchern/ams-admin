<template>
  <el-table
    ref="table"
    v-loading="loading"
    :data="tableData"
    style="width: 100%">
    <el-table-column
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      prop="oftenindicatorsName"
      label="指标常用分析名称"
      width="300">
    </el-table-column>
    <el-table-column
      prop="createPersonName"
      label="创建人"
      width="180">
    </el-table-column>
    <el-table-column
      prop="createTime"
      label="创建时间" :formatter="dateFormatter">
    </el-table-column>
  </el-table>
</template>

<script>
import $ from 'jquery'
export default {
  name:"commonlyAnalysisList",
  data() {
    return {
      tableData: [],
      loading:false
    }
  },
  created() {
    //获取指标常用分析列表
    this.loading = true
    let that = this;
    let url = this.contextUrl + "/InOftenindicators/getCommonlyAnalysisListByUserUuid";
    $.post(url,"",function(result){
      if(result.isError == true){
        that.$message({type:"info",message:result.message})
      }
      that.tableData = result.result
      that.loading = false
    },"json")
  },
  methods: {
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
    dateFormatter(row, column) {
      const datetime = row.createTime
      if (datetime) {
        let dateMat = new Date(datetime)
        let year = dateMat.getFullYear()
        let month = dateMat.getMonth() + 1
        let day = dateMat.getDate()
        let hours = dateMat.getHours()
        let minutes = dateMat.getMinutes()
        let second = dateMat.getSeconds()
        if (month.toString().length == 1) {
          month = "0" + month
        }
        if (day.toString().length == 1) {
          day = "0" + day
        }
        if (hours.toString().length == 1) {
          hours = "0" + hours
        }
        if (minutes.toString().length == 1) {
          minutes = "0" + minutes
        }
        if(second.toString().length == 1){
          second = "0" + second
        }
        var d = year + "-" + month + "-" + day + " " + hours + ":" + minutes+ ":" + second;
        return d;
      }
    },
    getSelectOption(){
      return this.$refs.table.selection
    }
  }
}
</script>
<style scoped>

</style>
