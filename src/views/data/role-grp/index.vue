<template>
  <div class="page-container">
    <el-row :gutter="5">
      <el-select v-model="currentScene" placeholder="请选择">
        <el-option
          v-for="scene in allScene"
          :key="scene.sceneUuid"
          :label="scene.sceneName"
          :value="scene"
        />
      </el-select>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="grp in currentScene.groups" :label="grp.grpName" :name="grp.grpCode">
          <MyElTree
            ref="tree1"
            v-loading="treeLoading"
            :props="props"
            class="filter-tree"
            :highlight-current="true"
            :data="treeData"
            node-key="id"
            :filter-node-method="filterNode"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span :title="node.name">{{ node.label }}</span>
            </span>
          </MyElTree>
        </el-tab-pane>
      </el-tabs>

      <el-col :span="6" class="left-tree" />

      <el-col :span="8">
        <div>已选择的用户组</div>
        <el-button @click="setExpireDate">设置使用期限</el-button>
        <el-table
          key="colMetaUuid"
          v-loading="listLoading"
          :data="currentData.cols"
          border
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column width="55">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.selected" />
            </template>
          </el-table-column>
          <el-table-column label="列名" width="200px" align="center" prop="colName" />
          <el-table-column label="别名" width="200px" align="center" prop="chnName" />
          <el-table-column label="加密策略" width="150px" align="center" prop="encryptType" />
        </el-table>
      </el-col>
    </el-row>
    <div class="bottom-btn">
      <el-button @click="save">保存</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { getResELTree, getResByRole, getRoleCols, saveRoleTable } from '@/api/data/table-info'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  data() {
    return {
      roleUuid: this.$route.params.roleUuid,
      allScene: [],
      currentScene: {},
      activeName: '',
      treeData: {},
      listLoading: false,
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      selectedData: []
    }
  },
  computed: {
  },
  watch: {
    filterText1(val) {
      this.$refs.tree1.filter(val)
    },
    filterText2(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.treeLoading = true
    getResELTree(0, '').then(resp => {
      this.treeData1 = resp.data
      this.treeLoading = false
    })
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    addRoleTable() {
      var ckTbs = this.$refs.tree1.getCheckedNodes(false, true)
      ckTbs.forEach((item) => {
        var pathArr = this.$refs.tree1.getNodePath(item)
        var current = this.treeData2[0].children
        for (var i = 0; i < pathArr.length; i++) {
          var path = pathArr[i]
          var nextNodes = current.filter((value, index) => { return value.id === path.id })
          if (nextNodes.length === 0) {
            var assPath = Object.assign({}, path)
            assPath.children = []
            current.push(assPath)
            current = assPath.children
          } else {
            current = nextNodes[0].children
          }
        }
      })
    },
    setExpireDate() {

    },
    /* 点击角色数据 展示列和wherestr */
    onclick2(node, data) {
      if (node.data.type === 'table') {
        if (node.data.cols) {
          this.currentData = node.data
        } else {
          this.listLoading = true
          getRoleCols(this.roleUuid, node.data.id).then(resp => {
            this.listLoading = false
            node.data.cols = resp.data
            this.currentData = node.data
            // if(!this.currentData.extMap) this.$set(this.currentData, 'extMap', null);
            this.currentData.cols.forEach(d => {
              this.$set(d, 'selected', d.roleCol !== null)
            })
          })
        }
      } else if (node.data.type === 'folder') {
        this.currentData = node.data
      }
    },

    save() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      var allNodes = this.$refs.tree2.getAllNodes()
      var folders = []
      var tables = []
      var cols = []
      console.log(this.roleUuid)
      allNodes.forEach(node => {
        var data = node.data
        if (data.type === 'folder') {
          folders.push({
            dataRoleUuid: this.roleUuid,
            folderUuid: data.id,
            accessType: data.extMap.accessType
          })
        } else if (data.type === 'table') {
          tables.push({
            dataRoleUuid: this.roleUuid,
            tableMetaUuid: data.id,
            whereStr: data.extMap.whereStr
          })
          if (data.cols) {
            data.cols.forEach(col => {
              if (col.selected) {
                cols.push({
                  colMetaUuid: col.colMetaUuid,
                  dataRoleUuid: this.roleUuid
                })
              }
            })
          }
        }
      })
      saveRoleTable(this.roleUuid, folders, tables, cols).then(() => {
        loading.close()
      })
    },
    goBack() {
      this.$router.go(-1)
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
