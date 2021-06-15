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
        <el-button type="primary" size="mini" class="oper-btn add" @click="handleCreate()" />
        <el-button type="primary" size="mini" class="oper-btn edit-4" :disabled="selections.length !== 1" @click="toEdit()" />
        <el-button type="primary" size="mini" class="oper-btn delete" :disabled="selections.length === 0" @click="handleDelete()" />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="业务场景名称" prop="sceneName" />
      <el-table-column label="业务场景编码" prop="sceneCode" />
      <el-table-column label="创建时间" prop="createTime" :formatter="formatCreateTime" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <template class="detail-form">
        <el-form
          ref="dataForm"
          :rules="rules"
          :model="temp"
          label-position="right"
          style="width: 600px; margin-left:50px;"
        >
          <el-form-item label="业务场景名称" prop="sceneName">
            <el-input v-model="temp.sceneName" />
          </el-form-item>
          <el-form-item label="业务场景编码" prop="sceneCode">
            <el-input v-model="temp.sceneCode" />
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del } from '@/api/data/scene'
import QueryField from '@/components/public/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'sceneUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '业务属性编码', name: 'sceneCode', type: 'text', value: '' },
        { label: '业务场景名称', name: 'sceneName', type: 'fuzzyText' },
        // {label: '性别', name:'sex', type: 'select',
        //   data: [{name: '男', value: '1'}, {name: '女', value: '0'}],
        //   default: '1'},
        { label: '创建时间', name: 'createTime', type: 'timePeriod' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        sceneUuid: undefined,
        sceneName: '',
        sceneCode: ''
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改业务场景',
        create: '新增业务场景'
      },
      dialogPvVisible: false,
      rules: {
        sceneName: [{ required: true, message: '请填写业务场景名称', trigger: 'change' }],
        sceneCode: [{ required: true, message: '请填写业务场景编码', trigger: 'change' }]
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
    formatCreateTime(row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.createTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
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
        sceneUuid: undefined,
        sceneName: '',
        sceneCode: ''
      }
    },
    toEdit() {
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.$router.push({
        path: '/data/sceneEdit',
        query: { sceneUuid: this.temp.sceneUuid, sceneName: this.temp.sceneName, sceneCode: this.temp.sceneCode }
      })
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
            const index = this.list.findIndex(v => v.sceneUuid === this.temp.sceneUuid)
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
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.sceneUuid) })
      this.$confirm('确定删除场景?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        del(ids.join(',')).then(() => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    }
  }
}
</script>
