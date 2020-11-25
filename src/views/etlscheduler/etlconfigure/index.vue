<template>
  <el-tabs type="border-card" style="background:transparent!important;height:100%;">
    <el-tab-pane label="参数管理"><etl-param-field /></el-tab-pane>
    <el-tab-pane label="数据源管理"><etl-data-source /></el-tab-pane>
    <!-- <el-tab-pane label="文件目录管理"><etl-file-directory /></el-tab-pane> -->
    <el-tab-pane label="数据资源管理"><etl-data-resource /></el-tab-pane>
    <!-- <el-tab-pane label="服务器管理">服务器管理</el-tab-pane> -->
    <!-- <el-tab-pane label="文件上传"><etl-file-upload /></el-tab-pane> -->
    <!-- <el-tab-pane label="hdfs文件管理"><etl-file-resource /></el-tab-pane> -->
    <!-- <el-tab-pane label="文件管理"><etl-file-manager /></el-tab-pane> -->
  </el-tabs>
</template>
<script>
import etlParamField from '@/views/etlscheduler/paramfield'
import etlDataResource from '@/views/etlscheduler/etlconfigure/dataresource'
import etlDataSource from '@/views/etlscheduler/etlconfigure/datasource'
// import etlFileDirectory from '@/views/etlscheduler/etlconfigure/filedirectory'
// import etlFileResource from '@/views/etlscheduler/fileresource'
// import etlFileUpload from '@/views/etlscheduler/upload'
// import etlFileManager from '@/views/etlscheduler/filemanager'
export default {
  // , etlFileUpload, etlFileResource, etlFileDirectory, etlFileManager
  components: { etlParamField, etlDataResource, etlDataSource }
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
