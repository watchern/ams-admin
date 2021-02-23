<template>
  <div class="app-container">
    <el-input
      v-model="filterText1"
      placeholder="输入关键字进行过滤"
    />
    <MyElTree
      ref="tree1"
      v-loading="treeLoading"
      :props="props"
      class="filter-tree"
      :highlight-current="true"
      :data="treeData1"
      :filter-node-method="filterNode"
      node-key="id"
      @node-click="nodeClick"
      @node-expand="nodeExpand"
      lazy
      :load="loadNode"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <i v-if="data.id==='root'" class="el-icon-s-home" />
        <i v-if="data.type==='folder'" class="el-icon-folder" />
        <i v-if="data.type==='table' && data.extMap.tblType==='T' && treeType==='common'">
          <span class="icon iconfont" style="padding-right: 3px;vertical-align: bottom;">&#xecee;</span>
        </i>
        <i v-if="data.type==='table' && data.extMap.tblType==='V' && treeType==='common'">
          <span class="icon iconfont" style="padding-right: 3px;vertical-align: bottom;">&#xe6cd;</span>
        </i>
        <i v-if="data.type==='column' && treeType==='common'" class="el-icon-c-scale-to-original" />
        <span :title="data.title" style=" line-height: 22px;">{{ node.label }}</span>
      </span>
    </MyElTree>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { getResELTree, getResByRole, getRoleCols, saveRoleTable, getTableCol } from '@/api/data/table-info'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  props: {
    dataUserId: String,
    sceneCode: String,
    treeType: {
      type: String,
      default: 'common' // common:正常的权限树   save:用于保存数据的文件夹树
    }
  },
  data() {
    return {
      filterText1: null,
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      tableIconPath: '../../images/ico/table_1.png',
      accessForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null
      },
      treeData1: [],
      treeLoading: false
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
    nodeExpand(){

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
    loadNode(node, resolve) {
      if(node.data.children && node.data.type!=='table'){
        resolve(node.data.children);
      }else if(node.data.type==='table' && node.data.children.length>0){
        resolve(node.data.children);
      }else if(node.data.type==='table' && node.data.children.length===0){
        getTableCol(node.data.id).then(resp => {
          var nodes = [];
          resp.data.forEach(e =>{
            nodes.push({
              id: e.colMetaUuid,
              label: e.colName,
              type: 'col',
              dataType: e.dataType,
              dataLength: e.dataLength,
              leaf: true,
              title: e.chnName
            })
          })
          resolve(nodes)
        })
      }else{
        // debugger;
      }
    },
    refresh() {
      this.treeLoading = true
      getResELTree({
        dataUserId: this.dataUserId,
        sceneCode: this.sceneCode,
        type: this.treeType
      }).then(resp => {
        this.treeLoading = false
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
