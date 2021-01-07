<template>
  <div class="app-container"  v-loading="loading" :element-loading-text="loadText">
    <!--模型分类树-->
    <el-container>
      <el-aside class="tree-side">
        <span class="spacetitle">当前空间：{{datausername}}</span>
        <ModelFolderTree ref="modelFolderTree" :power="power" @refreshModelList="refreshModelList" />
      </el-aside>
      <ModelListTable :data-user-id='dataUserId' :scene-code='sceneCode' ref="modelListTable" :power="power" @loadingSet="loadingSet" @refreshTree="refreshTree" />
    </el-container>
  </div>
</template>
<script>
import ModelFolderTree from '@/views/analysis/auditmodel/modelfoldertree'
import ModelListTable from '@/views/analysis/auditmodel/modellisttable'
export default {
  components: { ModelFolderTree, ModelListTable },
  computed:{
    datausername(){
      return this.$store.getters.datausername;
    }
  },
  props:['power','dataUserId','sceneCode'],
  data() {
    return {
      //dataSpaceName: sessionStorage.getItem("dataUserName"),
      dataSpaceName: this.$store.getters.datausername,
      loading:false,
      loadText:""
    }
  },
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
    },
    loadingSet(isShow,loadText){
      this.loading = isShow
      this.loadText = loadText;
    }
  }
}
</script>

<style scoped>
  .spacetitle{
    margin: 9px 10px 9px 9px;
    font-size: 20px;
    font-weight: bold;
  }
</style>
