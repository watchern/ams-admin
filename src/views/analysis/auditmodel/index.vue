<template>
  <div class="app-container">
    <!--模型分类树-->
    <el-container>
      <el-aside class="tree-side">
        <ModelFolderTree ref="modelFolderTree" :power="power" @refreshModelList="refreshModelList" />
      </el-aside>
      <ModelListTable ref="modelListTable" :power="power"  @refreshTree="refreshTree" />
    </el-container>
  </div>
</template>
<script>
import ModelFolderTree from '@/views/analysis/auditmodel/modelfoldertree'
import ModelListTable from '@/views/analysis/auditmodel/modellisttable'
export default {
  components: { ModelFolderTree, ModelListTable },
  props:['power'],
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
    },
    /**
     * 获取模型列表选中的数据
     */
    getModelListCheckData(){
      return this.$refs.modelListTable.getModelListCheckData()
    }
  }
}
</script>
