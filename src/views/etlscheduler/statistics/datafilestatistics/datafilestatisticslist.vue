<template>
  <div class="page-container">
    <el-col style="margin:20px;font-size:24px;">数据表文件明细</el-col>
    <el-row style="margin:20px">
      <el-col v-if="startTimeStart!=null && startTimeEnd != null" :span="12">作业时间范围{{ startTimeStart | formatDate }} 到  {{ startTimeEnd | formatDate }}</el-col>
      <el-col :span="12">业务系统: {{ titleMsg.sysName }}</el-col>
    </el-row>

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
        label="文件名称"
        align="center"
        prop="fileName"
      />
      <el-table-column
        label="文件路径"
        align="center"
        prop="fullPath"
      />
      <el-table-column
        label="表名"
        align="center"
        prop="odsTableName"
      />
      <el-table-column
        label="字段数量"
        align="center"
        prop="tableColumn"
      />
      <el-table-column
        label="文件大小"
        align="center"
        prop="fileSizeString"
      />
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pageQuery.pageNo"
        :limit.sync="pageQuery.pageSize"
        @pagination="getList"
      />
    </el-table>
    </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { datafileStatisticsListBySys } from '@/api/etlscheduler/statistics'
import dayjs from 'dayjs'

export default {
  components: { Pagination },
  filters: {
    formatDate(value, fmt) {
      fmt = fmt || 'YYYY-MM-DD'
      return dayjs(value).format(fmt)
    }
  },
  data() {
    return {
      tableKey: 'processInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      selections: [],
      queryDefault: {},
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
        // 开始运行时间，倒序排序
        sortBy: 'desc',
        sortName: 'startTime'
      },
      titleMsg: {},
      type: null,
      startTimeStart: null,
      startTimeEnd: null,
      value:'11111'
    }
  },
  watch: {
  },
  mounted() {

  },
  created() {
    if (this.$route.params instanceof Object) {
      this.type = this.$route.params.type
      this.titleMsg = this.$route.params.dataFile
      this.startTimeStart = this.$route.params.startTimeStart
      this.startTimeEnd = this.$route.params.startTimeEnd
    }
    this.getList({ dataType: this.type, dataResourceCode: this.titleMsg.sysCode,
      startTimeStart: this.startTimeStart, startTimeEnd: this.startTimeEnd })
  },
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      datafileStatisticsListBySys(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
      })
      this.listLoading = false
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
  /* border: 1px solid #343942 !important; */
  /* border-radius: 19px !important; */
  /* border-radius:19px !important; */
  font-size: 12px;
  /* color: #343942; */
  letter-spacing: 0;
  line-height: 12px;
 }
</style>
