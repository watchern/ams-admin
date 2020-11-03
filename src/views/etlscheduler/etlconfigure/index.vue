<template>
  <el-tabs type="border-card" style="background:transparent!important;height:100%;">
    <el-tab-pane label="数据源管理"><etl-data-source /></el-tab-pane>
    <el-tab-pane label="文件目录管理"><etl-file-directory /></el-tab-pane>
    <el-tab-pane label="数据资源管理"><etl-data-resource /></el-tab-pane>
    <el-tab-pane label="服务器管理">服务器管理</el-tab-pane>
  </el-tabs>
</template>
<script>
import etlDataResource from '@/views/etlscheduler/dataresource'
import etlDataSource from '@/views/etlscheduler/datasource'
import etlFileDirectory from '@/views/etlscheduler/filedirectory'
export default {
  components: { etlDataResource, etlDataSource, etlFileDirectory }
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
