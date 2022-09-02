<template>
  <div class="app-container"  v-loading="loading" :element-loading-text="loadText">
    <!--模型分类树-->
    <el-container>
      <el-aside class="tree-side">
        <Thresholdvaluetree :isShowEdit="true" :isShowValueTree="true" @refreshThresholdvalue="refreshThresholdvalue" ref="thresholdValueFolderTree" @refreshThresholdvalueList="refreshThresholdvalueList" />
      </el-aside>
      <Thresholdvaluelist ref="thresholdValueListTable" @loadingSet="loadingSet" @refreshTree="refreshTree" />
    </el-container>
  </div>
</template>
<script>
import Thresholdvaluetree from '@/views/analysis/thresholdvalue/thresholdvaluetree'
import Thresholdvaluelist from '@/views/analysis/thresholdvalue/thresholdvaluelistNew'
export default {
  components: { Thresholdvaluetree,Thresholdvaluelist },
  computed:{
  },
  data() {
    return {
      loading:false,
      loadText:""
    }
  },
  methods: {
    /**
     * 选择阈值
     * @param data 树节点数据
     */
    refreshThresholdvalue(data) {
      this.$refs.thresholdValueListTable.SelectNode(data)
    },
    /**
     * 刷新阈值列表
     * @param data 树节点数据
     */
    refreshThresholdvalueList(data) {
      this.$refs.thresholdValueListTable.setSelectTreeNode(data)
      var query = { thresholdValueFolderUuid: data.id }
      this.$refs.thresholdValueListTable.getList(query)
    },
    /**
     * 刷新阈值分类树
     */
    refreshTree() {
      this.$refs.thresholdValueFolderTree.getThresholdValueFolder()
    },
    loadingSet(isShow,loadText){
      this.loading = isShow
      this.loadText = loadText;
    }
  }
}
</script>

<style scoped>

</style>
