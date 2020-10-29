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
      max-height="800"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
      />
      <el-table-column
        label="所属系统"
        width="300px"
        align="center"
        prop="dataResourceCode"
      />
      <el-table-column
        label="文件名称"
        width="300px"
        align="center"
        prop="fullPath"
      />
      <el-table-column
        label="对应表"
        width="300px"
        align="center"
        prop="odsTableName"
      />
     <el-table-column
        label="接收时间"
       
        align="center"
        prop="createTime"
      />
      <el-table-column
        label="状态"
        width="300px"
        align="center"
        prop=""
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
import {listByPage} from '@/api/etlscheduler/dataFile'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'dataFileUuid',
      list: null,
      total: 0,
      listLoading: false,
       // 格式化状态
      formatMap: {
        status: {
          1: '已接收',
          0: '未接收'
        }
      },
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '文件名称', name: 'fullPath', type: 'text', value: '' },
        { label: '表名称', name: 'odsTableName', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '接收状态', name: '', type: 'select',
          data: [{ name: '已接收', value: '1' }, { name: '未接收', value: '0' }],
        },
        { label: '时间', name: '', type: 'timePeriod', value: '' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'createTime'
      },
      temp: {
        dataResourceCode: null,
        fullPath: null,
        odsTableName: null,
        createTime: null,
      },
      selections: [],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      console.log('query:' + JSON.stringify(query))
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
<style>
 
</style>
