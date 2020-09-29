<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div>
      <el-button
        type="primary"
        size="mini"
        @click="handleCreate()"
      >添加</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length !== 1"
        @click="handleUpdate()"
      >修改</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="startStatus"
        @click="handleStart()"
      >启用</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="stopStatus"
        @click="handleStop()"
      >停用</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleDelete()"
      >删除</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleDownload()"
      >下载</el-button>
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
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="流程名称"
        width="200px"
        align="center"
        prop="name"
      />
      <el-table-column
        label="排序号"
        width="150px"
        align="center"
        prop="orderNo"
      />
      <el-table-column
        label="状态"
        width="150px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
      <el-table-column
        label="流程描述"
        prop="description"
      />
      <el-table-column
        label="最新修改人"
        width="250px"
        align="center"
        prop="updateUserName"
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, del, updateDefinitionStatus, exportProcess } from '@/api/etlscheduler/processdefinition'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'processDefinitionUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '流程名称', name: 'name', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '流程状态', name: 'status', type: 'select',
          data: [{ name: '启用', value: '1' }, { name: '停用', value: '0' }],
          default: '1'
        }
      ],
      // 格式化参数列表
      formatMap: {
        status: {
          1: '启用',
          0: '停用',
          null: '启用'
        }
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        processDefinitionUuid: null
      },
      selections: [],
      downloadLoading: false,
      startStatus: true,
      stopStatus: true
    }
  },
  watch: {
    // 监听selections集合
    selections() {
      if (this.selections.length > 0) {
        this.startStatus = false
        this.stopStatus = false
        this.selections.forEach((r, i) => {
          if (r.status === 1) {
            this.startStatus = true
          } else if (r.status === 0) {
            this.stopStatus = true
          }
        })
      } else {
        this.startStatus = true
        this.stopStatus = true
      }
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
    handleCreate() {
      this.$router.push('/etlscheduler/workflow')
    },
    handleUpdate() {
      this.temp = Object.assign({}, this.selections[0])
      // 编辑的页面跳转
      this.$router.push(`/etlscheduler/definition/${this.temp.processDefinitionUuid}`)
    },
    handleStart() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
      updateDefinitionStatus(ids.join(','), 1).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '启用成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleDownload() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
      exportProcess(ids.join(',')).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '下载成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleStop() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
      updateDefinitionStatus(ids.join(','), 0).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '停用成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processDefinitionUuid) })
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
    },
    // 格式化表格
    formatStatus(data) {
      return this.formatMap.status[data.status]
    }
  }
}
</script>
