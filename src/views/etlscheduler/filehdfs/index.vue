<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div style="float: left;">
      <!-- 添加文件夹 -->
      <el-button type="primary" class="oper-btn add" title="上传文件夹" :disabled="createDirStatus" @click="handleCreate()" />
      <!-- 修改 -->
      <el-button type="primary" class="oper-btn edit" title="修改" :disabled="selections.length !== 1" @click="handleUpdate()" />
      <!-- 删除 -->
      <el-button type="primary" class="oper-btn delete" title="删除" :disabled="selections.length === 0" @click="handleDelete()" />
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      stripe
      fit
      style="width: 100%;"
      :data="list"
      border
      highlight-current-row
      max-height="800"
      lazy
      row-key="path"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
      />
      <el-table-column
        label="目录名称"
        align="center"
        prop="name"
      />
      <el-table-column
        label="路径"
        align="center"
        prop="path"
      />
      <el-table-column
        label="文件大小"
        align="center"
        prop="sizeString"
      />
    </el-table>
    <!-- <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <!-- label-width="140px"
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="目录名称"
          prop="dirName"
        >
          <el-input
            v-model="dirName"
            placeholder="请输入目录名称"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >确定</el-button>
      </div>
    </el-dialog> -->
    <!-- 添加和编辑的弹框 -->
    <el-dialog
      title="创建文件夹"
      :visible.sync="creatDirdialogFormVisible"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="dataForm"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="目录名称"
          prop="dirName"
        >
          <el-input
            v-model="dirName"
            placeholder="请输入目录名称"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="creatDirdialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="createFileDir()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBylist, save, update, createDir, deleteFile } from '@/api/etlscheduler/filehdfs'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { QueryField },
  data() {
    return {
      tableKey: 'fileDirectoryUuid',
      list: null,
      total: 0,
      listLoading: false,
      // 格式化参数列表
      formatMap: {
        fileDirectoryType: {
          1: '存储目录',
          2: '执行目录',
          3: '备份目录',
          4: '异常目录',
          5: '手动备份目录',
          null: '其它目录'
        }
      },
      queryFields: [
        {
          label: '目录类型', name: 'directoryType', type: 'select',
          data: [{ name: '存储目录', value: '1' }, { name: '执行目录', value: '2' },
            { name: '备份目录', value: '3' }, { name: '异常目录', value: '4' }, { name: '手动备份目录', value: '5' }],
          default: '1'
        }
      ],
      pageQuery: {},
      temp: {
        directoryType: null,
        directoryPath: null,
        name: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      // 添加的表单验证
      rules: {
        paramName: [{ required: true, message: '请填写文件名称', trigger: 'change' }],
        paramType: [{ required: true, message: '请选择文件的类型', trigger: 'change' }],
        status: [{ required: true, message: '请填写文件的路径', trigger: 'change' }]
      },
      rulesCreat: {
        dirName: [{ required: true, message: '请填写文件名称', trigger: 'change' }]
      },
      downloadLoading: false,
      creatDirdialogFormVisible: false,
      createDirStatus: true,
      dirName: null
    }
  },
  watch: {
    selections() {
      // 选择1条数据
      if (this.selections.length === 1) {
        if (this.selections[0].ifDir) {
          this.createDirStatus = false
        }

        // this.selections.forEach((r, i) => {
        //   console.log(r)

        //   // 如果是文件夹的话，创建文件夹可用
        //   if (r.isDir) {
        //     this.createDirStatus = false
        //   }
        // })
      } else {
        this.createDirStatus = true
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery = query
      getBylist(this.pageQuery).then(resp => {
        this.list = resp.data
        this.listLoading = false
      })
    },
    createFileDir() {
      createDir({ name: this.dirName, path: this.selections[0].path }).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
      this.dirName = null
      this.creatDirdialogFormVisible = false
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        status: null
      }
    },
    handleCreate() {
      this.resetTemp()
      this.creatDirdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          save(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    handleUpdate() {
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.fileDirectoryUuid === this.temp.fileDirectoryUuid)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    handleDelete() {
      var path = []
      this.selections.forEach((r, i) => { path.push(r.path) })
      deleteFile({ path: path.join(',') }).then((res) => {
        this.getList()
        if (res.code === 0) {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        } else {
          this.$message.error(this.$t(res.msg))
        }
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    // 格式化表格
    formatType(data) {
      return this.formatMap.fileDirectoryType[data.directoryType]
    }
  }
}
</script>
