<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="6">
        <el-input
          v-model="filterText1"
          placeholder="输入关键字进行过滤"
        />
        <!--<el-select defaultFirstOption="true" @change="handleSelectChange" :value="selectValue">
          <el-option label="显示所有" value="all"></el-option>
          <el-option label="只显示未注册" value="noPart"></el-option>
          <el-option label="只显示已注册" value="yesPart"></el-option>
        </el-select>-->
        <MyElTree
          ref="tree1"
          :props="props"
          :load="loadNode1"
          lazy
          :filter-node-method="filterNode"
          class="filter-tree"
          show-checkbox
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <i v-if="data.type==='USER'" class="el-icon-menu" style="color:#409EFF" />
            <i v-if="data.type==='TABLE'" class="el-icon-tickets" style="color:#409EFF" />
            <i v-if="data.type==='COLUMN'" class="el-icon-s-ticket" style="color:#409EFF" />
            <span>{{ node.label }}</span>
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
              @click="asyncTable"
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
      <el-col :span="12">
        <el-input
          v-model="filterText2"
          placeholder="输入关键字进行过滤"
        />
        <MyElTree
          ref="tree2"
          :props="props"
          :load="loadNode2"
          lazy
          :filter-node-method="filterNode"
          class="filter-tree"
          highlight-current="true"
          node-key="id"
          show-checkbox
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <i v-if="data.id==='ROOT'" class="el-icon-s-home" style="color:#409EFF" />
            <i v-if="data.type==='FOLDER'" class="el-icon-folder" style="color:#409EFF" />
            <i v-if="data.type==='TABLE'" class="el-icon-tickets" style="color:#409EFF" />
            <i v-if="data.type==='COLUMN'" class="el-icon-c-scale-to-original" style="color:#409EFF" />
            <span>{{ node.label }}</span>
            <span style="margin-left: 10px">
              <!--添加： 根节点以及手工维护的节点-->
              <el-button
                v-if="data.id === 'ROOT' || (data.extMap && data.extMap.folder_type==='maintained')"
                type="text"
                size="mini"
                @click.stop="() => handleCreateFolder(node, data)"
              ><i class="el-icon-circle-plus" /></el-button>
              <!--修改： 手工维护的节点-->
              <el-button
                v-if="data.extMap && data.extMap.folder_type==='maintained'"
                type="text"
                size="mini"
                @click.stop="() => handleUpdateFolder(node, data)"
              > <i class="el-icon-edit" /> </el-button>
              <!--删除： 手工维护的节点-->
              <el-button
                v-if="data.extMap && data.extMap.folder_type==='maintained'"
                type="text"
                size="mini"
                @click.stop="() => handleRemoveFolder(node, data)"
              > <i class="el-icon-delete" /> </el-button>
              <!--更新： 表-->
              <el-button
                v-if="data.type === 'TABLE'"
                type="text"
                size="mini"
                @click.stop="() => handleRemoveFolder(node, data)"
              > <i class="el-icon-delete" /> </el-button>
            </span>
          </span>
        </MyElTree>
      </el-col>
    </el-row>
    <el-dialog :title="dialogTitle" :visible.sync="folderFormVisible" width="500px">
      <el-form ref="folderForm" :model="folderForm" label-width="80px">
        <el-form-item label="文件夹名称" label-width="120px">
          <el-input v-model="folderForm.folderName" style="width: 300px;" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="dialogStatus==='create'?createFolder():updateFolder()">确定</el-button>
        <el-button @click="folderFormVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { listUnCached, getDataTreeNode, saveTable, updateTable, delTable } from '@/api/data/table-info'
import { saveFolder, updateFolder, delFolder } from '@/api/data/folder'
import { commonNotify } from '@/utils'

export default {
  components: { MyElTree },
  data() {
    return {
      filterText1: null,
      filterText2: null,
      fromData: [],
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      folderForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null
      },
      folderFormVisible: false,
      dialogStatus: '',
      parentNode: {},
      tempData: {}, // 点击编辑时临时存放data
      textMap: {
        update: '编辑文件夹',
        create: '添加文件夹'
      },
      selectValue: 1
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
    resetFolderForm() {
      Object.keys(this.folderForm).forEach(key => {
        this.$set(this.folderForm, key, null)
      })
    },
    handleCreateFolder(node, data) {
      this.resetFolderForm()
      this.parentNode = node
      this.dialogStatus = 'create'
      this.folderForm.parentFolderUuid = data.id
      var nodePath = this.$refs.tree2.getNodePath(data)
      var fullPath = []
      nodePath.forEach(path => {
        fullPath.push(path.id)
      })
      this.folderForm.fullPath = fullPath.join('/')
      this.folderFormVisible = true
    },
    handleUpdateFolder(node, data) {
      this.resetFolderForm()
      this.tempData = data
      this.dialogStatus = 'update'
      this.folderForm.folderUuid = data.id
      this.folderForm.folderName = data.label
      this.folderForm.fullPath = this.$refs.tree2.getNodePath(data)
      this.folderFormVisible = true
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
      saveFolder(this.folderForm).then(resp => {
        var childData = {
          id: resp.data,
          label: this.folderForm.folderName,
          pid: this.folderForm.parentFolderUuid,
          type: 'FOLDER',
          extMap: {
            folder_type: 'maintained'
          }
        }
        this.$refs.tree2.append(childData, this.parentNode)
        this.$notify(commonNotify({ type: 'success', message: '创建成功！' }))
        this.folderFormVisible = false
      })
    },
    updateFolder() {
      updateFolder({
        folderUuid: this.folderForm.folderUuid,
        folderName: this.folderForm.folderName
      }).then(resp => {
        this.tempData.label = this.folderForm.folderName
        this.$refs.tree2.updateKeyChildren(this.folderForm.folderUuid, this.tempData)
        this.folderFormVisible = false
      })
    },
    handleSelectChange(val) {

    },
    asyncTable() {
      var ckTbs = this.$refs.tree1.getCheckedNodes()
      var ckFolder = this.$refs.tree2.getCurrentNode()
      if (ckTbs.length === 0) {
        this.$notify(commonNotify({ type: 'warning', message: '请勾选左侧表' }))
        return false
      }
      if (!ckFolder || ckFolder.type !== 'FOLDER') {
        this.$notify(commonNotify({ type: 'warning', message: '请选中文件夹' }))
        return false
      }
      ckTbs.filter(tb => {
        return tb.type === 'TABLE'
      }).forEach(node => {
        const tableForm = {
          tableMetaUuid: node.id,
          dbName: node.pid,
          tbName: node.label,
          folderUuid: ckFolder.id
        }
        saveTable(tableForm).then(resp => {
          var childData = {
            disable: false,
            id: tableForm.tableMetaUuid,
            label: tableForm.tbName,
            leaf: true,
            pid: ckFolder.id,
            showCheckbox: true,
            type: 'TABLE'
          }
          this.$refs.tree2.remove(childData)
          this.$refs.tree2.append(childData, ckFolder)
          this.$notify(commonNotify({ type: 'success', message: `表<${node.label}>成功同步成功！` }))
        })
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
