<template>
  <div class="app-container" ref="bigLoading" >
<!--    v-loading="loading" :element-loading-text="loadText"-->
    <!--模型分类树-->
    <el-container>
      <el-aside class="tree-side">
        <ModelFolderTree ref="modelFolderTree" :power="power" @refreshModelList="refreshModelList" @refreshModels="refreshModels" :spaceFolderName="thisFolderName" :spaceFolderId="thisDataUserId"/>
      </el-aside>
      <ModelListTable :isAuditWarning="isAuditWarning" :data-user-id='thisDataUserId' :scene-code='thisSceneCode' ref="modelListTable" :power="power" @loadingSet="loadingSet" @refreshTree="refreshTree"/>
    </el-container>
  </div>
</template>
<script>
import ModelFolderTree from '@/views/analysis/auditmodel/modelfoldertree'
import ModelListTable from '@/views/analysis/auditmodel/modellisttable'
import {changeNodeIcon} from "../../../api/graphtool/js/common";
export default {
  components: { ModelFolderTree, ModelListTable },
  computed:{
    datausername(){
      return this.$store.getters.datausername;
    },
    thisDataUserId(){
      return this.dataUserId ? this.dataUserId:this.$store.getters.datauserid;
    },
    thisSceneCode(){
      return this.sceneCode ? this.sceneCode:this.$store.getters.scenecode;
    },
    thisFolderName(){
      return this.folderName ? this.folderName:'个人模型';
    }
  },
  props:['power','dataUserId','sceneCode','isAuditWarning','folderName'],
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
     * 选择模型
     * @param data 树节点数据
     */
    refreshModels(data) {
      this.$refs.modelListTable.SelectNode(data)
    },
    /**
     * 刷新模型列表
     * @param data 树节点数据
     */
    refreshModelList(data) {
      let query = {}
      data.type == "model"? query = { modelUuid: data.id ,pid: data.pid } : query = {modelFolderUuid: data.id, modelFolderPath: data.path }
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
     * 刷新模型分类树
     */
    getRootFolderUuid(id) {
      return this.$refs.modelFolderTree.getRootFolderUuid(id)
    },
    /**
     * 获取模型列表选中的数据
     */
    getModelListCheckData(){
      return this.$refs.modelListTable.getModelListCheckData()
    },
    loadingSet(isShow,loadText){
      if(isShow){
        let _this = this
        this.bigLoading = $(this.$refs.bigLoading).mLoading({ 'text': loadText, 'hasCancel': true, 'hasTime': true, "callback" : function () {
            _this.bigLoading.destroy()
            _this.$refs.modelListTable.canceltab()
          }})
      }else {
        this.bigLoading.destroy()
      }
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
