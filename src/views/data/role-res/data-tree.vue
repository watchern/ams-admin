<template>
  <div class="app-container">
    <el-input
      v-model="filterText1"
      placeholder="输入关键字进行过滤"
    />
    <MyElTree
      ref="tree1"
      :props="props"
      class="filter-tree"
      :highlight-current="true"
      :data="treeData1"
      :filter-node-method="filterNode"
      node-key="id"
      @node-click="nodeClick"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <i v-if="data.id==='root'" class="el-icon-s-home" style="color:#409EFF" />
        <i v-if="data.type==='folder'" class="el-icon-folder" style="color:#409EFF" />
        <i v-if="data.type==='table'" class="el-icon-tickets" style="color:#409EFF" />
        <i v-if="data.type==='column'" class="el-icon-c-scale-to-original" style="color:#409EFF" />
        <span :title="node.name">{{ node.label }}</span>
      </span>
    </MyElTree>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { getResELTree, getResByRole, getRoleCols, saveRoleTable } from '@/api/data/table-info'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  props:{
    dataUserId: String,
    sceneCode: String
  },
  data() {
    return {
      filterText1: null,
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      accessForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null
      },
      treeData1: []
    }
  },
  computed: {
  },
  watch: {
    filterText1(val) {
      this.$refs.tree1.filter(val)
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getTree() {
      return this.$refs.tree1
    },
    nodeClick(data, node, tree) {
      this.$emit('node-click', data, node, tree)
    },
    appendnode(childData, parentNode) {
      this.$refs.tree1.append(childData, parentNode)
      parentNode.loaded = false
      parentNode.expand()
    },
    remove(data, parentNode) {
      data.forEach((r, i) => {
        this.$refs.tree1.remove(r)
      })
      parentNode.loaded = false
      parentNode.expand()
    },
    refresh() {
      getResELTree({
        dataUserId: this.dataUserId,
        sceneCode: this.sceneCode
      }).then(resp => {
        this.treeData1 = resp.data
      })
    }
  } // 注册
}

</script>

<style lang="scss" scoped>
  .filter-tree {
    margin-top: 20px;
  }
  .dialog-bottom-btns{

  }
  .transfer-center-item{
    width: 40px;
    margin: 2px
  }
  .page-container .left-tree{
    height: 80vh;
    overflow: scroll;
  }
  .bottom-btn{
    float: right;
    padding-right: 100px
  }
</style>
