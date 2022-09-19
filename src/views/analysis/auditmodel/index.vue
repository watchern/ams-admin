<template>
  <div class="app-container" ref="bigLoading" >
<!--    v-loading="loading" :element-loading-text="loadText"-->
    <!--模型分类树-->
    <el-container class="content-box">
      <el-aside class="tree-side" :style="{ width: maxWidth - rightWidth + 'px' }">
        <ModelFolderTree ref="modelFolderTree" :isShowButton="isShowButton" :power="power" @refreshModelList="refreshModelList" @refreshModels="refreshModels" :spaceFolderName="thisFolderName" :spaceFolderId="thisDataUserId"/>
      </el-aside>
      <div class="drawer-box" :style="{ width: rightWidth + 'px' }"  ref="drawerBox">
        <div class="myxhandle"  style="left:0;"  @mousedown="mouseDown($event)" ><i class="el-icon-d-caret skin-textColor" /></div>
        <ModelListTable  :isAuditWarning="isAuditWarning" :data-user-id='thisDataUserId' :scene-code='thisSceneCode' ref="modelListTable" :power="power" @loadingSet="loadingSet" @refreshTree="refreshTree"/>
      </div>
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
  props:['power','dataUserId','sceneCode','isAuditWarning','folderName','width'],
  data() {
    return {
      isShowButton: true,
      //dataSpaceName: sessionStorage.getItem("dataUserName"),
      dataSpaceName: this.$store.getters.datausername,
      loading:false,
      loadText:"",
      //右侧宽度
      rightWidth: 1200,
      lastX: "",
      changeWidth: 0,
      maxWidth: 0, // 最大宽度
    }
  },
  destroyed() {
    document.removeEventListener("mouseup", this.mouseUp);
  },
  created () {
    // 打开页面恢复默认状态
    document.onmousemove = null
    this.lastX = "";
    this.$nextTick(() => {
      // 模型预警选择模型时弹框展示此页面最大宽度为80%
      const container = document.getElementsByClassName('content-box')[0];
      const bodyWidth = document.body.clientWidth;
      if (this.width) {
        this.maxWidth = container.clientWidth;

        this.maxWidth = bodyWidth * 0.8
      } else {
        this.maxWidth = container.clientWidth;
      }
      // 右侧宽度默认为最大宽度减去右侧最小宽度
      this.rightWidth = this.maxWidth -300;
    })
  },
  mounted () {
    // 监听屏幕大小
    window.onresize = () => {
      return (() => {
        const container = document.getElementsByClassName('content-box')[0];
        const bodyWidth = document.body.clientWidth;
        if (this.width) {
          this.maxWidth = container.clientWidth;
          this.maxWidth = bodyWidth * 0.8
        } else {
          this.maxWidth = container.clientWidth;
        }
      })()
    }
  },
  watch: {
    // 屏幕大小改变时修改左右两边的默认宽度
    maxWidth: {
      handler: function (val) {
        if (val) {
          this.rightWidth = this.maxWidth -300;
        }
      },
      immediate: true,
      deep:true
    },
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
    },
    mouseDown (event) {
      let that = this;
      this.lastX = event.screenX;
      document.onmousemove = function (e) {
        let movement = Number(that.lastX - e.screenX);
        let changeWidth = that.rightWidth + movement;
        if ((that.maxWidth - changeWidth> 300) && (changeWidth>880)) { // 左侧最小宽度为300，右侧最小宽度为880
          that.rightWidth = changeWidth;
        }
        that.lastX = e.screenX;
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
        that.lastX = "";
      }
    },

  }
}
</script>

<style scoped>
  .spacetitle{
    margin: 9px 10px 9px 9px;
    font-size: 20px;
    font-weight: bold;
  }
  .content-box {
    position: relative;
  }
  .drawer-box {
    position: absolute;
    right: 0;
    /* top: 0;
    bottom: 0; */
    height: 100%;
  }
  .myxhandle {
    height: 100%;
    width: 15px;
    position: absolute;
    top: 0;
    bottom: -100px;
    cursor: w-resize;
    z-index: 200;
    background: transparent;
    display: inline-block;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
  .myxhandle .el-icon-d-caret {
    position: relative;
    top: 50%;
    left: -50%;
    font-size: 20px;
    transform: rotate(90deg);
  }
</style>
