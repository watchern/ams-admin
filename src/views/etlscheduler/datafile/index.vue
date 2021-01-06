<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
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
      height="calc(100vh - 280px)"
      max-height="calc(100vh - 280px)"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
      />
      <el-table-column
        label="所属系统"
        width="150px"
        align="center"
        prop="dataResourceName"
      />
      <el-table-column
        label="文件名称"
        prop="fullPath"
      />
      <el-table-column
        label="表名称"
        prop="odsTableName"
      />
      <el-table-column
        label="数据时间"
        prop="dataDate"
      />
      <el-table-column
        label="接收时间"
        prop="recieveTime"
      />
      <el-table-column
        label="更新时间"
        prop="updateTime"
      />
      <el-table-column
        label="状态"
        width="300px"
        align="center"
        prop="status"
        :formatter="formatStatus"
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
import { listByPage } from '@/api/etlscheduler/datafile'
import QueryField from '@/components/Ace/query-field/index'
import store from '@/store'
import dayjs from 'dayjs'

export default {
  components: { Pagination, QueryField },
  props: {
    searchParams: Object
  },
  data() {
    return {
      store,
      tableKey: 'dataFileUuid',
      list: null,
      total: 0,
      listLoading: false,
      // 格式化状态
      formatMap: {
        status: {
          0: '未接收',
          1: '已接收'
        }
      },
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '文件名称', name: 'fullPath', type: 'text', value: '' },
        { label: '表名称', name: 'odsTableName', type: 'text', value: '' },
        // { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '接收状态', name: 'status', type: 'select',
          data: [{ name: '已接收', value: '1' }, { name: '未接收', value: '0' }]
        },
        { label: '接收时间', name: 'startTime', type: 'timePeriod', value: '' }
      ],
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
        sortBy: 'desc',
        sortName: 'updateTime'
      },
      temp: {
        dataResourceCode: null,
        fullPath: null,
        odsTableName: null,
        createTime: null
      },
      selections: []
    }
  },
  watch: {
    searchParams: {
      deep: true,
      immediate: true,
      handler() {
        this.queryDefault = {
          startTimeStart: dayjs(this.store.state.monitor.processStartTime).format('YYYY-MM-DD'),
          startTimeEnd: dayjs(this.store.state.monitor.processEndTime).format('YYYY-MM-DD')
        }
        this.queryFields[3].value = this.queryDefault.startTimeStart + ',' + this.queryDefault.startTimeEnd
        this.getList(this.queryDefault)
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
        this.pageQuery.pageNo = 1
      }
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
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    formatStatus(data) {
      return this.formatMap.status[data.status]
    }
  }
}
</script>
