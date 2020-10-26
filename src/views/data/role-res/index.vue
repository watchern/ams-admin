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
        <div v-if="currentData !== {}">
          <el-table
            key="colMetaUuid"
            v-loading="listLoading"
            :data="currentData.cols"
            border
            fit
            highlight-current-row
            style="width: 100%;"
            @select="onSelectCol"
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
        </div>
      </el-col>

    </el-row>
    <div class="bottom-btn">
      <el-button @click="save">保存</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>

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
import { getResELTree, getResByRole, getRoleCols, saveRoleTable } from '@/api/data/table-info'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  data() {
    return {
      roleUuid: this.$route.params.roleUuid,
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
      listLoading: false,
      currentData: {}, // 当前选中的数据表
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
    getResELTree(0, '').then(resp => {
      this.treeData1 = resp.data
    })
    getResByRole(this.$route.params.roleUuid).then(resp => {
      resp.data.forEach(item => {
        this.treeData2[0].children.push(item)
      })
    })
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    resetAccessForm() {
      Object.keys(this.accessForm).forEach(key => {
        this.$set(this.accessForm, key, null)
      })
    },
    handleCreateFolder(node, data) {
      this.resetAccessForm()
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
      this.resetAccessForm()
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
        /* var childData = {
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
        this.accessFormVisible = false*/
      })
    },
    updateFolder() {
      updateFolder(this.accessForm).then(resp => {
        this.tempData.label = this.accessForm.folderName
        this.$refs.tree2.updateKeyChildren(this.accessForm.folderUuid, this.tempData)
        this.accessFormVisible = false
      })
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
          getRoleCols(this.roleUuid, node.data.id).then(resp => {
            node.data.cols = resp.data
            this.currentData = node.data
            this.currentData.cols.forEach(d => {
              this.$set(d, 'selected', d.roleCol !== null)
            })
          })
        }
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
      console.log(allNodes)
      allNodes.forEach(node => {
        var data = node.data
        if (data === 'folder') {
          folders.push({
            dataRoleUuid: this.dataRoleUuid,
            folderUuid: data.id,
            accessType: 0
          })
        } else if (data === 'table') {
          tables.push({
            dataRoleUuid: this.dataRoleUuid,
            tableMetaUuid: data.id,
            whereStr: data.extMap.whereStr
          })
        }
      })
      saveRoleTable().then(() => {
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
