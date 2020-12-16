<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <el-row>
      <el-col align="right">
        <!-- 新增 -->
        <el-button type="primary" class="oper-btn add" title="新增" @click="handleCreate()" />
        <!-- 修改 -->
        <el-button type="primary" class="oper-btn edit" title="修改" :disabled="selections.length !== 1" @click="handleUpdate()" />
        <!-- 删除 -->
        <el-button type="primary" class="oper-btn delete" title="删除" :disabled="selections.length === 0" @click="handleDelete()" />
      </el-col>
    </el-row>
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
        label="目录类别"
        align="center"
        prop="directoryType"
        :formatter="formatType"
      />
      <!-- <el-table-column
        label="目录类型"
        width="150px"
        align="center"
        prop="paramType"
        :formatter="formatType"
      />
      <el-table-column
        label="挂载服务器"
        width="150px"
        align="center"
        prop="defaultValue"
      /> -->
      <el-table-column
        label="目录路径"
        align="center"
        prop="directoryPath"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
      />
      <el-table-column
        label="创建人"
        align="center"
        prop="createUserName"
      />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
    <!-- 添加和编辑的弹框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="目录名称"
          prop="name"
        >
          <el-input
            v-model="temp.name"
            placeholder="请输入目录名称"
          />
        </el-form-item>
        <el-form-item
          label="目录类别"
          prop="directoryType"
        >
          <el-select
            v-model="temp.directoryType"
            placeholder="请选择目录类别"
          >
            <el-option
              label="存储目录"
              :value="1"
            />
            <el-option
              label="执行目录"
              :value="2"
            />
            <el-option
              label="备份目录"
              :value="3"
            />
            <el-option
              label="异常目录"
              :value="4"
            />
            <el-option
              label="手动备份目录"
              :value="5"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="目录路径"
          prop="directoryPath"
        >
          <el-input
            v-model="temp.directoryPath"
            placeholder="请输入目录路径"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">返回</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del } from '@/api/etlscheduler/filedirectory'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
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
        { label: '目录名称', name: 'name', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '目录类型', name: 'directoryType', type: 'select',
          data: [{ name: '存储目录', value: '1' }, { name: '执行目录', value: '2' },
            { name: '备份目录', value: '3' }, { name: '异常目录', value: '4' }, { name: '手动备份目录', value: '5' }],
          default: '1'
        }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        directoryType: null,
        directoryPath: null,
        name: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑文件目录',
        create: '新增文件目录'
      },
      dialogPvVisible: false,
      // 添加的表单验证
      rules: {
        paramName: [{ required: true, message: '请填写文件名称', trigger: 'change' }],
        paramType: [{ required: true, message: '请选择文件的类型', trigger: 'change' }],
        status: [{ required: true, message: '请填写文件的路径', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
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
        directoryType: null,
        directoryPath: null,
        name: null
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
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
              title: this.$t('message.title'),
              message: this.$t('message.insert.success'),
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
              title: this.$t('message.title'),
              message: this.$t('message.update.success'),
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.fileDirectoryUuid) })
      del(ids.join(',')).then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: this.$t('message.delete.success'),
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
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

