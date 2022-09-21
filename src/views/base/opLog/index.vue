<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div style="height: 24px;"></div>
    <el-table
      ref="table"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      :height="autoHeight"
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="操作用户" width="100px" prop="opUserName" />
      <el-table-column label="操作IP" width="160px" align="center" prop="opIp" />
      <el-table-column label="操作模块" width="200px" align="center" prop="moduleName" />
      <el-table-column label="操作子模块" width="200px" prop="subModuleName" />
      <el-table-column label="操作类型" width="100px" prop="opOperate" />
      <el-table-column label="操作信息" prop="opInfo" />
      <el-table-column label="操作时间" prop="opTime" align="center" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
  </div>
</template>
<script>
import { listByPageOperationLog } from '@/api/base/base'
import QueryField from '@/components/public/query-field/index'
import Pagination from '@/components/Pagination/index'
import BaseVue from '@/utils/baseVue'
let baseVue = new BaseVue({
    targetel: "table",
})
export default {
  components: { Pagination, QueryField },
  mixins:[baseVue],
  data() {
    return {
      tableKey: 'errorUuid',
      list: null,
      total: 0,
      listLoading: false,
      queryFields: [
        { label: '操作用户', name: 'opUserName', type: 'text', value: '' },
        { label: '操作IP', name: 'opIp', type: 'text' },
        { label: '操作模块', name: 'moduleName', type: 'text' },
        { label: '操作时间范围', name: 'opTime', type: 'timePeriod' }
      ],
      // selectedRowVal:0,
      tableOptions: {
        columnDefs: [
          {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 30,
            pinned: 'left',
            display: false
          },
          {
            field: 'errorUuid',
            hide: true
          },
          {
            headerName: '操作用户',
            field: 'opUserName',
            pinned: 'left',
            filter: 'agTextColumnFilter'
          },
          {
            headerName: '操作IP',
            field: 'opIp',
            pinned: 'left'
          },
          {
            headerName: '模块名称',
            field: 'moduleName',
            pinned: 'left'
          },
          {
            headerName: '子模块名称',
            field: 'subModuleName',
            pinned: 'left'
          },
          {
            headerName: '操作类型',
            field: 'opOperate',
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: '操作时间',
            field: 'opTime',
            filter: 'agDateColumnFilter'
          },
          {
            headerName: '操作信息',
            field: 'opInfo',
            filter: 'agNumberColumnFilter'
          }
        ]
      },
      formStyle: {
        width: '700px',
        height: '400px'
      },
      temp: {
        logSysActiUuid: '',
        opIp: '',
        moduleName: '',
        opOperate: '',
        opInfo: '',
        opTime: '',
        opUserId: '',
        opUserName: '',
        subModuleName: ''
      },
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
        sortBy: 'desc',
        sortName: 'opTime'
      }
    }
  },
  computed: {

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
      listByPageOperationLog(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.selections = val
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
    resetQuery() {
      this.query = {
        condition: {
          opIp: '',
          moduleName: '',
          opOperate: '',
          opInfo: '',
          endTime: '',
          opTime: '',
          opUserName: ''

        }
      }
    }
  }
}
</script>
