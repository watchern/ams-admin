<template>
  <div class="page-container">
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item label="统计粒度">
          <el-select v-model="granularity">
            <el-option v-for="opt in dataTypes" :key="opt.key" :label="opt.name" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item label="作业时间范围">
          <template>
            <el-date-picker v-model="StratTimeStart" :type="datepickerType" placeholder="开始时间" />-
            <el-date-picker v-model="StratTimeEnd" :type="datepickerType" placeholder="结束时间" />
          </template>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button type="primary" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
      <!-- <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      /> -->
    </div>
    <div style="float: left;">
      <el-button type="primary" class="oper-btn" icon="el-icon-download" title="导出" @click="exportFile" />
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
        prop="dateString"
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
import { resourceStatisticsList } from '@/api/etlscheduler/statistics'
import axios from 'axios'
import qs from 'qs'

export default {
  components: { Pagination },
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
      granularity: { name: '年', value: 'year', key: 1 },
      // granularity:'timePeriod',
      dataTypes: [{ name: '年', value: 'year', key: 1 },
        { name: '月', value: 'month', key: 2 },
        { name: '日', value: 'date', key: 3 }],
      StratTimeStart: new Date(),
      StratTimeEnd: new Date(),
      datepickerType: 'year',
      // queryFields: [
      //   // {
      //   //   label: '统计粒度', name: 'type', type: 'select',
      //   //   data: [{ name: '年', value: '1' },
      //   //     { name: '月', value: '2' },
      //   //     { name: '日', value: '3' }],
      //   //   default: '1'
      //   // },
      //   { label: '作业时间范围', name: 'dataTime', type: 'timePeriod', value: '' }
      //   // ,
      //   // { label: '作业时间范围', name: 'monthTime', type: 'monthPeriod', value: '' },
      //   // { label: '作业时间范围', name: 'yearTime', type: 'yearPeriod', value: '', datatype: 1 }
      // ],
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
      // this.queryFields[0].type = this.granularity.value

      if (this.granularity.value !== this.datepickerType) {
        this.datepickerType = this.granularity.value
        this.StratTimeStart = null
        this.StratTimeEnd = null
      }
    }
  },
  mounted() {
    // this.queryFields[0].type = this.granularity.value
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      resourceStatisticsList({ granularity: this.granularity.key, stratTimeStart: this.StratTimeStart, stratTimeEnd: this.StratTimeEnd }).then(resp => {
        this.list = resp.data
        this.listLoading = false
      })
    },
    onSubmit() {
      this.getList()
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    exportFile() {
      axios.post(`/etlscheduler/statistics/exportFile`, qs.stringify({ resourceStatistics: JSON.stringify(this.list) }),
        { responseType: 'blob', headers: {
          'Content-Type': 'application/x-www-form-urlencoded' // 请求的数据类型为form data格式
        }}
      ).then((res) => {
        const filename = decodeURI(
          res.headers['content-disposition'].split(';')[1].split('=')[1]
        )
        const blob = new Blob([res.data], {
          type: 'application/octet-stream'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
      })
      this.dialogFormVisible1 = false
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
    clearAll() {
      this.granularity = null
      this.StratTimeStart = null
      this.StratTimeEnd = null
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
  /* border: 1px solid #343942 !important; */
  /* border-radius: 19px !important; */
  /* border-radius:19px !important; */
  font-size: 12px;
  /* color: #343942; */
  letter-spacing: 0;
  line-height: 12px;
 }
</style>
