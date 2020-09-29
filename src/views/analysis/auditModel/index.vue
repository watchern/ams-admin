<template>
  <div class="app-container">
    <!--模型分类树-->
    <el-container style="height: 500px; border: 1px solid #eee">
      <el-aside width="300px" style="background-color: rgb(238, 241, 246)">
        <ModelFolderTree ref="modelFolderTree" @refreshModelList="refreshModelList" />
      </el-aside>
      <ModelListTable ref="modelListTable" @refreshTree="refreshTree" />
    </el-container>
  </div>
</template>
<script>
import ModelFolderTree from '@/views/analysis/auditModel/modelFolderTree'
import ModelListTable from '@/views/analysis/auditModel/modelListTable'
export default {
  components: { ModelFolderTree, ModelListTable },
  methods: {
    /**
     * 刷新模型列表
     * @param data 树节点数据
     */
    refreshModelList(data) {
      var query = { modelFolderUuid: data.id }
      this.$refs.modelListTable.getList(query)
      this.$refs.modelListTable.setSelectTreeNode(data)
    },
    /**
     * 刷新模型分类树
     */
    refreshTree() {
      this.$refs.modelFolderTree.getModelFolder()
    }
  }
}
</script>
