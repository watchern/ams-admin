<template>
  <div class="page-container">
    <div class="filter-container">
      <!-- :query-default="queryDefault" -->
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" class="oper-btn excel" title="导出" @click="exportFile" />
      </el-col>
    </el-row>
    <div class="etl-datafilestatistics2-list">
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
        align="center"
        prop="sysName"
      />
      <el-table-column
        label="数据表文件总数"
        align="center"
        prop="allFileSize"
      >
        <template slot-scope="scope">
          <el-link target="_blank" :underline="false" type="primary" @click="datafileStatisticsList(scope.row,null)">{{ scope.row.allFileSize }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="增量表文件数"
        align="center"
        prop="incrementSize"
      >
        <template slot-scope="scope">
          <el-link target="_blank" :underline="false" type="primary" @click="datafileStatisticsList(scope.row,1)">{{ scope.row.incrementSize }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="全量表文件数"
        align="center"
        prop="fullSize"
      >
        <template slot-scope="scope">
          <el-link target="_blank" :underline="false" type="primary" @click="datafileStatisticsList(scope.row,2)">{{ scope.row.fullSize }}</el-link>
        </template>
      </el-table-column>

      <!-- <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pageQuery.pageNo"
        :limit.sync="pageQuery.pageSize"
        @pagination="getList"
      /> -->
    </el-table>
    </div>
    </div>
</template>

<script>
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { datafileStatisticsList } from '@/api/etlscheduler/statistics'
import axios from 'axios'
import QueryField from '@/components/Ace/query-field/index'
import qs from 'qs'

export default {
  // Pagination,
  components: { QueryField },
  data() {
    return {
      tableKey: 'processInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
        // 开始运行时间，倒序排序
        sortBy: 'desc',
        sortName: 'startTime'
      },
      queryFields: [
        { label: '接收时间范围', name: 'startTime', type: 'timePeriod', value: '' }
      ],
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
      if (query) this.pageQuery.condition = query
      datafileStatisticsList(this.pageQuery).then(resp => {
        this.list = resp.data
      })
      this.listLoading = false
    },
    datafileStatisticsList(dataFile, type) {
      this.$router.push({ path: '/etlscheduler/datafilestatisticslist', name: 'datafilestatisticslist', params: {
        dataFile: dataFile,
        type: type,
        startTimeStart: this.pageQuery.condition.startTimeStart,
        startTimeEnd: this.pageQuery.condition.startTimeEnd
      }})
    },
    onSubmit() {
      this.getList()
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    exportFile() {
      axios.post(`/etlscheduler/statistics/exportDatafileStatistics`, qs.stringify({ datafileStatistics: JSON.stringify(this.list) }),
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
 .etl-datafilestatistics2-list{
    height: 71.5%;
    overflow: auto;
 }
</style>
