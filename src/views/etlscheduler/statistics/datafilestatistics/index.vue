<template>
  <div class="page-container">
    <div class="filter-container">
      <el-form :inline="true">
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
        label="业务系统"
        prop="systemName"
      />
      <el-table-column
        label="数据表文件总数"
        align="center"
        prop="totalFiles"
      />
      <el-table-column
        label="增量表文件数"
        align="center"
        prop="incrementFiles"
      />
      <el-table-column
        label="全量表文件数"
        align="center"
        prop="FullFiles"
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
import { datafileStatisticsList } from '@/api/etlscheduler/statistics'
import axios from 'axios'
import qs from 'qs'

export default {
  components: { Pagination },
  data() {
    return {
      tableKey: 'processInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      StratTimeStart: null,
      StratTimeEnd: null,
      datepickerType: 'date',
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20
      },
      selections: []
    }
  },
  watch: {
  },
  mounted() {
   
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      // datafileStatisticsList({stratTimeStart: this.StratTimeStart, stratTimeEnd: this.StratTimeEnd }).then(resp => {
      //   this.list = resp.data
      //   this.listLoading = false
      // })
      datafileStatisticsList().then(resp => {
       console.log('map-map-map:' + resp)
      })
      this.list = null
      this.listLoading = false
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
