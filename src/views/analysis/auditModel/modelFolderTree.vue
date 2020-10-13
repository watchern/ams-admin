<template>
  <div class="app-container">
    <!--模型分类树-->
    <el-input
      v-model="filterText"
      placeholder="输入关键字进行过滤"
    />
    <el-tree
      ref="tree"
      :data="data"
      :props="defaultProps"
      :filter-node-method="filterNode"
      default-expand-all
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>
          <i :class="data.icon" />{{ node.label }}
        </span>
        <span v-if="data.type=='folder'">
          <el-button type="text" size="mini" @click="() => setSelectTreeNode(node,data,1)"><i class="el-icon-circle-plus" /></el-button>
          <el-button type="text" size="mini" @click="() => setSelectTreeNode(node, data,2)"><i class="el-icon-edit" /></el-button>
          <el-button type="text" size="mini" @click="() => deleteFolder(node, data)"><i class="el-icon-delete" /></el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog v-if="dialogFormVisible" title="请填写分类信息" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="分类名称" :label-width="formLabelWidth">
          <el-input v-model="form.modelFolderName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="() => enterBtn()">确 定</el-button>
      </div>
    </el-dialog>
  </div>

</template>
<script>
import { findModelFoldeTree, deleteModelFolder, addModelFolder, updateModelFolder } from '@/api/analysis/auditModel'
export default {
  name: 'ModelFolderTree',
  data() {
    return {
      filterText: null,
      data: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      selectTreeNode: {},
      operationType: 0, // 操作类型 1、添加；2、修改
      dialogFormVisible: false,
      form: {
        modelFolderUuid: '',
        modelFolderName: '',
        parentUuid: '',
        folderSort: '',
        folderPath: '',
        pbScope: ''
      },
      formLabelWidth: '120px'
    }
  },
  watch: {
    filterText(val) {
      // 搜索树
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getModelFolder()
  },
  methods: {
    /**
     *获取模型分类
     */
    getModelFolder() {
      findModelFoldeTree().then(result => {
        this.data = result.data
      })
    },
    /**
     * 树的点击事件
     * @param data 树的对象数据 包括子节点
     */
    handleNodeClick(data) {
      if (data.type == 'model') {

      } else {
        this.$emit('refreshModelList', data)
      }
    },
    /**
     * 树过滤
     * @param value 过滤值
     * @param data 数据
     * @returns {boolean}
     */
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    /**
     * 设置选中的节点
     * @param node 整个节点数据
     * @param data 数据 要设置的节点数据
     * @param operationType 1、添加；2、修改
     */
    setSelectTreeNode(node, data, operationType) {
      this.operationType = operationType
      this.selectTreeNode = data
      if (operationType == 2) {
        this.form.modelFolderName = this.selectTreeNode.label
      }
      this.dialogFormVisible = true
    },
    /**
     * 清空表单信息
     */
    clearForm() {
      this.form = {
        modelFolderUuid: '',
        modelFolderName: '',
        parentUuid: '',
        folderSort: '',
        folderPath: '',
        pbScope: ''
      }
    },
    /**
     * 生成UUID
     * @returns {string} 返回生成的UUID
     */
    getGuuid() {
      var s = []
      var hexDigits = '0123456789abcdef'
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
      }
      s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = '-'
      var uuid = s.join('')
      return uuid
    },
    /**
     * 表单确定按钮
     */
    enterBtn() {
      if (this.operationType == 1) {
        this.addModelFolder()
      } else {
        this.updateFolder()
      }
    },
    /**
     * 添加模型分类
     */
    addModelFolder() {
      this.form.modelFolderUuid = this.getGuuid()
      this.form.parentUuid = this.selectTreeNode.id
      this.form.folderSort = 0
      this.form.folderPath = ''
      this.form.pbScope = this.selectTreeNode.extMap.pbScope
      addModelFolder(this.form).then(result => {
        if (result != null && result.code == 0) {
          const newChild = {
            id: this.form.modelFolderUuid,
            label: this.form.modelFolderName,
            children: [],
            pid: this.selectTreeNode.id,
            icon: 'el-icon-folder',
            extMap: { pbScope: this.selectTreeNode.extMap.pbScope }
          }
          if (!this.selectTreeNode.children) {
            this.$set(this.selectTreeNode, 'children', [])
          }
          this.selectTreeNode.children.push(newChild)
        } else {
          this.$notify({ success: '失败', message: '添加模型分类失败' })
        }
      })
      // this.clearForm();
      this.dialogFormVisible = false
    },
    /**
     * 修改模型分类
     */
    updateFolder() {
      this.form.modelFolderUuid = this.selectTreeNode.id
      this.form.parentUuid = null
      this.form.folderSort = null
      this.form.folderPath = null
      this.form.pbScope = null
      updateModelFolder(this.form).then(result => {
        if (result.code == 0) {
          this.getModelFolder()
        }
      })
      this.dialogFormVisible = false
    },
    /**
     * 删除模型分类
     * @param node 节点对象
     * @param data 节点数据
     */
    deleteFolder(node, data) {
      if (data.pid == 0) {
        this.$message({ success: 'info', message: '根目录不允许删除' })
        return
      }
      if ((data.children != undefined && data.children.length == 0) || data.children == undefined) {
        var obj = { modelFolderUuid: data.id }
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteModelFolder(obj).then(result => {
            if (result.code == 0) {
              this.getModelFolder()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        this.$message({ success: 'error', message: '该分类下有分类或模型，不允许删除' })
      }
    }
  }
}
</script>
