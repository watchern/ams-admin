<template>
  <div class="page-container">
    <el-row :gutter="5">

      <el-col :span="6">
        <el-input
          v-model="filterText1"
          placeholder="输入关键字进行过滤"
        />
        <MyElTree
          ref="tree1"
          :props="props"
          class="filter-tree"
          highlight-current="true"
          :data="treeData1"
          node-key="id"
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
              :disabled="fromDisabled"
              @click="addRoleTable"
            />
          </p>
          <p class="transfer-center-item">
            <el-button
              type="primary"
              :disabled="toDisabled"
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
          highlight-current="true"
          :data="treeData2"
          node-key="id"
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

      <el-col :span="6">
        <el-input
          v-model="filterText2"
          placeholder="输入关键字进行过滤"
        />
        <MyElTree
          ref="tree2"
          :props="props"
          class="filter-tree"
          highlight-current="true"
          :data="treeData2"
          node-key="id"
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

      <el-col :span="6">
        <!--<el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          border
          fit highlight-current-row
          style="width: 100%;"
          @sort-change="sortChange"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="列名" width="200px" align="center" prop="dataRoleName" />
          <el-table-column label="别名" width="300px" align="center" :formatter="formatCreateTime" prop="createTime" />
          <el-table-column label="加密策略" width="200px" align="center" prop="authenType" />
        </el-table>-->
      </el-col>

    </el-row>

    <el-dialog :title="dialogTitle" :visible.sync="accessFormVisible" width="500px">
      <el-form ref="accessForm" :model="accessForm" label-width="80px">
        <el-form-item label="文件夹名称" label-width="120px">
          <el-input v-model="accessForm.folderName" style="width: 300px;" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="dialogStatus==='create'?createFolder():updateFolder()">确定</el-button>
        <el-button @click="accessFormVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { getResELTree, getResByRole } from '@/api/data/table-info'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  data() {
    return {

      filterText1: null,
      filterText2: null,
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
      accessFormVisible: false,
      dialogStatus: '',
      parentNode: {},
      tempData: {}, // 点击编辑时临时存放data
      textMap: {
        update: '编辑文件夹',
        create: '添加文件夹'
      },
      selectValue: 1,
      treeData1: [],
      treeData2: [{
        id: 'ROOT',
        label: '角色数据',
        children: []
      }],
      listLoading: false
    }
  },
  computed: {
    dialogTitle() {
      return (this.parentNode.label == null ? '' : '在<' + this.parentNode.label + '>下') + this.textMap[this.dialogStatus]
    },
    fromDisabled() {
      return false
    },
    toDisabled() {
      return false
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
    getResELTree(0, '').then(resp => {
      this.treeData1 = resp.data
    })
    getResByRole(this.$route.params.roleUuid).then(resp => {
      this.treeData2.children.push(resp.data)
    })
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    loadNode1(node, resolve) {
      if (node.level <= 3) {
        var pid = node.data ? node.data.id : 'ROOT'
        listUnCached(node.level, pid).then(resp => {
          resolve(resp.data)
        })
      } else {
        resolve([])
      }
    },
    loadNode2(node, resolve) {
      var pid = node.data ? node.data.id : null
      if (!node.data) {
        resolve([{ id: 'ROOT', label: '数据集', leaf: false }])
      } else {
        getDataTreeNode(node.data.id).then(resp => {
          resolve(resp.data)
        })
      }
    },
    resetaccessForm() {
      Object.keys(this.accessForm).forEach(key => {
        this.$set(this.accessForm, key, null)
      })
    },
    handleCreateFolder(node, data) {
      this.resetaccessForm()
      this.parentNode = node
      this.dialogStatus = 'create'
      this.accessForm.parentFolderUuid = data.id
      var nodePath = this.$refs.tree2.getNodePath(data)
      var fullPath = []
      nodePath.forEach(path => {
        fullPath.push(path.id)
      })
      this.accessForm.fullPath = fullPath.join('/')
      this.accessFormVisible = true
    },
    handleUpdateFolder(node, data) {
      this.resetaccessForm()
      this.tempData = data
      this.dialogStatus = 'update'
      this.accessForm.folderUuid = data.id
      this.accessForm.folderName = data.label
      this.accessForm.fullPath = this.$refs.tree2.getNodePath(data)
      this.accessFormVisible = true
    },
    handleRemoveFolder(node, data) {
      console.log(this.$refs.tree2.getCurrentNode())
      this.$confirm('是否删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delFolder(data.id).then(resp => {
          this.$notify(commonNotify({ type: 'success', message: '删除成功！' }))
          this.$refs.tree2.remove(data)
        })
      }).catch(() => {
      })
    },
    createFolder() {
      saveFolder(this.accessForm).then(resp => {
        var childData = {
          id: resp.data,
          label: this.accessForm.folderName,
          pid: this.accessForm.parentFolderUuid,
          type: 'FOLDER',
          extMap: {
            folder_type: 'maintained'
          }
        }
        this.$refs.tree2.append(childData, this.parentNode)
        this.$notify(commonNotify({ type: 'success', message: '创建成功！' }))
        this.accessFormVisible = false
      })
    },
    updateFolder() {
      updateFolder(this.accessForm).then(resp => {
        this.tempData.label = this.accessForm.folderName
        this.$refs.tree2.updateKeyChildren(this.accessForm.folderUuid, this.tempData)
        this.accessFormVisible = false
      })
    },
    handleSelectChange(val) {

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
      var ids = this.$refs.tree2.getCheckedKeys()
      delTable(ids.join(',')).then(resp => {
        this.$notify(commonNotify({ type: 'success', message: `成功移除${ids.length}张表` }))
        ids.forEach(id => {
          this.$refs.tree2.remove({ id: id })
        })
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
</style>
