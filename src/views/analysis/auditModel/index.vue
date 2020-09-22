<template>
  <div class="app-container">
    <!--模型分类树-->
    <el-container style="height: 500px; border: 1px solid #eee">
      <el-aside width="300px" style="background-color: rgb(238, 241, 246)">
        <ModelFolderTree></ModelFolderTree>
      </el-aside>
        <ModelListTable></ModelListTable>
    </el-container>
  </div>
</template>
<script>
import ModelFolderTree from "@/views/analysis/auditModel/modelFolderTree";
import ModelListTable from "@/views/analysis/auditModel/modelListTable";
export default {
  components: { ModelFolderTree,ModelListTable },
}
</script>
