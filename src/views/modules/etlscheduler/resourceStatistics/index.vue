<template>
  <div class="page-container">
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item label="统计粒度">
          <el-select v-model="granularity">
            <el-option v-for="opt in dataTypes" :key="opt.key" :label="opt.name" :value="opt" />
          </el-select>
        </el-form-item>
      </el-form>
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
        label="调度日期"
        align="center"
        prop="scheduleTime"
      />
      <el-table-column
        label="调度任务"
        align="center"
        prop="scheduleName"
      />
      <el-table-column
        label="耗时"
        align="center"
        prop="timeConsuming"
      >
        <template slot-scope="scope">
          {{ scope.row.timeConsuming | timeFilter }}
        </template></el-table-column>
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
import { resourceStatisticsList } from '@/api/etlscheduler/processinstance'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
  filters: {
    // 耗时的时间格式转换
    timeFilter(value) {
      const time = value
      if (time === null || time === '' || time === 0) {
        return 0 + '秒'
      } else {
        if (time / 1000 >= 0 && time / 1000 < 60) {
          return (time / 1000).toFixed(1) + '秒'
        } else if (time / 1000 >= 60 && time / 1000 < 3600) {
          return (time / 60000).toFixed(1) + '分'
        } else if (time / 1000 > 3600) {
          return (time / 3600000).toFixed(1) + '时'
        }
      }
    }
  },
  data() {
    return {
      tableKey: 'processInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      granularity: { name: '日', value: 'timePeriod', key: 3 },
      // granularity:'timePeriod',
      dataTypes: [{ name: '年', value: 'yearPeriod', key: 1 },
        { name: '月', value: 'monthPeriod', key: 2 },
        { name: '日', value: 'timePeriod', key: 3 }],
      queryFields: [
        // {
        //   label: '统计粒度', name: 'type', type: 'select',
        //   data: [{ name: '年', value: '1' },
        //     { name: '月', value: '2' },
        //     { name: '日', value: '3' }],
        //   default: '1'
        // },
        { label: '作业时间范围', name: 'dataTime', type: 'timePeriod', value: '' }
        // ,
        // { label: '作业时间范围', name: 'monthTime', type: 'monthPeriod', value: '' },
        // { label: '作业时间范围', name: 'yearTime', type: 'yearPeriod', value: '', datatype: 1 }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20
        // ,
        // 开始运行时间，倒序排序
        // sortBy: 'desc',
        // sortName: 'startTime'
      },
      selections: []
    }
  },
  watch: {
    granularity() {
      this.queryFields[0].type = this.granularity.value
      this.queryFields[0].value = null
    }
  },
  mounted() {
    this.queryFields[0].type = this.granularity.value
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      query.granularity = this.granularity.key
      console.log('query+=====' + JSON.stringify(query))
      if (query) this.pageQuery.condition = query
      resourceStatisticsList(this.pageQuery).then(resp => {
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
    }
  }
}
</script>

<style scoped>
  .el-tag {
	background-color: transparent;
	border-color: transparent;
	color: #409eff;
  font-size: 22px;
  cursor: pointer;
  }
  .logcol{
  font-size: 24px;
	font-family: 'Arial Negreta', 'Arial Normal', 'Arial';
	font-weight: 700;
	font-style: normal;
	font-size: 18px;
	color: #676A6C;
  }
  .logtype{
	font-family: 'Arial Negreta', 'Arial Normal', 'Arial';
	font-weight: 700;
	font-style: normal;
  color: #3f3a3a;
  padding: 5px 0px;
  }
  .el-select{
  /* display: inline-flex !important; */
  border: 1px solid #343942 !important;
  /* border-radius: 19px !important; */
  /* border-radius:19px !important; */
  font-size: 12px;
  color: #343942;
  letter-spacing: 0;
  line-height: 12px;
 }
</style>
