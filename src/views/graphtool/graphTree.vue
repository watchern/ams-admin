<template>
  <div class="app-container">
    <!--图形树-->
    <el-input v-model="filterText" placeholder="输入关键字进行过滤" class="tree-search" />
    <MyElTree
      ref="tree"
      v-loading="treeLoading"
      :data="data"
      :default-expanded-keys="['myGraph']"
      :props="defaultProps"
      :filter-node-method="filterNode"
      :highlight-current="true"
      :expand-on-click-node="false"
      node-key="id"
      :current-node-key="defaultNodeKey"
      @node-expand="nodeExpand"
      @node-click="nodeclick"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>
          <i class="el-icon-folder" />
          <span :title="node.name">{{ node.label }}</span>
        </span>
        <!--<span v-if="data.type=='folder'">-->
        <!--<el-button type="text" size="mini" class="tree-line-btn" @click.stop="() => setSelectTreeNode(node,data,1)"><svg-icon icon-class="icon-add-1" /></el-button>-->
        <!--<el-button type="text" size="mini" class="tree-line-btn" @click.stop="() => setSelectTreeNode(node, data,2)"><svg-icon icon-class="icon-edit-1" /></el-button>-->
        <!--<el-button type="text" size="mini" class="tree-line-btn" @click.stop="() => deleteFolder(node, data)"><svg-icon icon-class="icon-delete-1" /></el-button>-->
        <!--</span>-->
      </span>
    </MyElTree>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { getGraphTrees } from '@/api/graphtool/graphList'
export default {
  name: 'GraphTree',
  components: { MyElTree },
  data() {
    return {
      filterText: '',
      defaultProps: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      },
      data: [],
      treeLoading: false,
      defaultNodeKey: 'privateGraph'
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.initGraphTree()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    initGraphTree() {
      getGraphTrees().then(response => {
        this.data = response.data
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.defaultNodeKey)
        })
      })
    },
    nodeExpand(obj, treeNode, el) {
      console.log(treeNode)
    },
    nodeclick(obj, treeNode, el) {
      if (treeNode.data.id !== 'myGraph') {
        this.$emit('refreshGraphList', treeNode.data)
      }
    }
  }
}
</script>
