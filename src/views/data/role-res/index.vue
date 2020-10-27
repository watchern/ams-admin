<template>
  <div class="page-container">
    <el-row :gutter="5">

      <el-col :span="6" class="left-tree">
        <el-input
          v-model="filterText1"
          placeholder="输入关键字进行过滤"
        />
        <MyElTree
          ref="tree1"
          v-loading="tree1Loading"
          :props="props"
          class="filter-tree"
          :highlight-current="true"
          :data="treeData1"
          node-key="id"
          :filter-node-method="filterNode"
          show-checkbox
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <i v-if="data.id==='root'" class="el-icon-s-home" style="color:#409EFF" />
            <i v-if="data.type==='folder'" class="el-icon-folder" style="color:#409EFF" />
            <i v-if="data.type==='table'" class="el-icon-tickets" style="color:#409EFF" />
            <i v-if="data.type==='column'" class="el-icon-c-scale-to-original" style="color:#409EFF" />
            <span :title="node.name">{{ node.label }}</span>
          </span>
        </MyElTree>

      </el-col>

      <el-col :span="2" style="width: 45px; padding-top: 10%">
        <div class="transfer-center">
          <p class="transfer-center-item">
            <el-button
              type="primary"
              icon="el-icon-arrow-right"
              circle
              @click="addRoleTable"
            />
          </p>
          <p class="transfer-center-item">
            <el-button
              type="primary"
              icon="el-icon-arrow-left"
              circle
              @click="removeTable"
            />
          </p>
        </div>
      </el-col>

      <el-col :span="6">
        <el-input
          v-model="filterText2"
          placeholder="输入关键字进行过滤"
        />
        <MyElTree
          ref="tree2"
          :props="props"
          class="filter-tree"
          :highlight-current="true"
          :data="treeData2"
          node-key="id"
          :expand-on-click-node="false"
          show-checkbox
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <i v-if="data.id==='root'" class="el-icon-s-home" style="color:#409EFF" />
            <i v-if="data.type==='folder'" class="el-icon-folder" style="color:#409EFF" />
            <i v-if="data.type==='table'" class="el-icon-tickets" style="color:#409EFF" />
            <i v-if="data.type==='column'" class="el-icon-c-scale-to-original" style="color:#409EFF" />
            <span :title="node.name" @click="onclick2(node)">{{ node.label }}</span>
            <!--<span v-if="data.id!=='root'"></span>-->
          </span>
        </MyElTree>
      </el-col>

      <el-col :span="8">
        <div v-if="currentData !== null">
          <span>{{ currentData.label }}</span>
          <div v-if="currentData.type==='table'">
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
            <div>
              <el-input
                v-model="currentData.extMap.whereStr"
                type="textarea"
                :rows="2"
                placeholder="请输入筛选语句，如： name='张三' and age=19 "
              />
            </div>
          </div>
          <div>
            <div>访问类型</div>
            <el-checkbox
              v-model="currentData.extMap.accessType"
              label="完全控制"
              true-label="1"
              false-label="0"
            />
          </div>
        </div>
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
      filterText1: null,
      filterText2: null,
      tree1Loading: false,
      listLoading: false,
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      treeData1: [],
      treeData2: [{
        id: 'ROOT',
        label: '角色数据',
        children: []
      }],
      currentData: null, // 当前选中的数据表
      currentSelection: []
    }
  },
  computed: {
    dialogTitle() {
      return (this.parentNode.label == null ? '' : '在<' + this.parentNode.label + '>下') + this.textMap[this.dialogStatus]
    }
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
    this.tree1Loading = true
    getResELTree(0, '').then(resp => {
      this.treeData1 = resp.data
      this.tree1Loading = false
    })
    getResByRole(this.$route.params.roleUuid).then(resp => {
      resp.data.forEach(item => {
        // 将 accessType 的 0， 1 转为 false， true 让elcheckbox认识
        item.extMap.accessType = item.extMap.accessType === 1
        this.treeData2[0].children.push(item)
      })
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
    removeTable() {

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
