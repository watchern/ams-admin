<template>
  <el-tabs type="border-card" style="background:transparent!important;height:100%;">
    <el-tab-pane label="上游资源统计"><etl-data-file-statistics /></el-tab-pane>
    <el-tab-pane label="消耗资源统计"><etl-resource-statistics /></el-tab-pane>
  </el-tabs>
</template>
<script>
import etlDataFileStatistics from '@/views/etlscheduler/statistics/datafilestatistics'
import etlResourceStatistics from '@/views/etlscheduler/statistics/resourcestatistics'
export default {
  components: { etlResourceStatistics, etlDataFileStatistics }
}
</script>
<style>
.el-tab-pane{
  background: transparent;
}
.el-tabs{
  padding: 0;
}

/* .el-tabs--border-card > .el-tabs__content {
    padding: 0px!important;
} */
.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
    color: #1890ff;
    background-color: transparent !important;
    border-right-color: #dcdfe6;
    border-left-color: #dcdfe6;
}
</style>
