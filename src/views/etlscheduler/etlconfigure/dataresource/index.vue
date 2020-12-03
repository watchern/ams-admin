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
        <el-button type="primary" class="oper-btn add" title="新增" @click="handleCreate()" />
        <el-button type="primary" class="oper-btn edit" :disabled="selections.length !== 1" title="编辑" @click="handleUpdate()" />
        <el-button type="primary" class="oper-btn delete" :disabled="selections.length === 0" title="删除" @click="handleDelete()" />
      </el-col>
    </el-row>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      stripe
      fit
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      height="calc(100vh - 320px)"
      max-height="calc(100vh - 320px)"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="系统名称"
        prop="dataResourceName"
      >
        <template slot-scope="scope">
          <el-link :underline="false" type="primary" @click="findDataResour(scope.row)">
            {{ scope.row.dataResourceName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="系统编码"
        width="300px"
        align="center"
        prop="dataResourceCode"
      />
      <el-table-column
        label="系统描述"
        prop="dataResourceDesc"
      />
      <el-table-column
        label="修改时间"
        width="300px"
        align="center"
        prop="updateTime"
      />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="系统名称"
          prop="dataResourceName"
        >
          <el-input
            v-model="temp.dataResourceName"
            :disabled="disableUpdate"
            :placeholder="disableUpdate === true ? '' : '请输入系统名称'"
          />
        </el-form-item>
        <el-form-item
          label="系统编码"
          prop="dataResourceCode"
        >
          <el-input
            v-model="temp.dataResourceCode"
            :disabled="disableUpdate"
            :placeholder="disableUpdate === true ? '' : '请输入系统编码'"
          />
        </el-form-item>
        <el-form-item
          label="系统描述"
          prop="dataResourceDesc"
        >
          <el-input
            v-model="temp.dataResourceDesc"
            type="textarea"
            :disabled="disableUpdate"
            :placeholder="disableUpdate === true ? '' : '请输入系统描述'"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-if="!closeStatus" @click="dialogFormVisible = false">取消</el-button>
        <el-button
          v-if="closeStatus"
          type="primary"
          @click="dialogFormVisible = false"
        >关闭</el-button>
        <el-button
          v-if="!closeStatus"
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del } from '@/api/etlscheduler/dataresource'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'dataResourceUuid',
      list: null,
      total: 0,
      listLoading: false,
      disableUpdate: false,
      closeStatus: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '资源编码', name: 'dataResourceCode', type: 'text', value: '' },
        { label: '资源名称', name: 'dataResourceName', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' }
      ],
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 10,
        sortBy: 'desc',
        sortName: 'updateTime'
      },
      temp: {
        dataResourceCode: null,
        dataResourceDesc: null,
        dataResourceName: null,
        dataResourceUuid: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改数据资源',
        create: '新增数据资源',
        show: '查看数据资源'
      },
      dialogPvVisible: false,
      rules: {
        dataResourceName: [{ required: true, message: '请填写资源名称', trigger: 'change' }],
        dataResourceDesc: [{ max: 100, message: '请填写资源描述', trigger: 'change' }],
        dataResourceCode: [{ required: true, message: '请填写资源编码', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    findDataResour(data) {
      this.closeStatus = true
      this.disableUpdate = true
      this.temp = Object.assign({}, data) // copy obj
      this.dialogStatus = 'show'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
        // console.log(resp.data)
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleFilter() {
      this.pageQuery.pageNo = 2
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
        dataResourceCode: null,
        dataResourceDesc: null,
        dataResourceName: null,
        dataResourceUuid: null
      }
    },
    handleCreate() {
      this.closeStatus = false
      this.disableUpdate = false
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
      this.closeStatus = false
      this.disableUpdate = false
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
            const index = this.list.findIndex(v => v.dataResourceUuid === this.temp.dataResourceUuid)
            this.list.splice(index, 1, this.temp)
            this.getList()
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
      this.selections.forEach((r, i) => { ids.push(r.dataResourceUuid) })
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
