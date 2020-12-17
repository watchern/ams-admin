<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;" @sort-change="" @selection-change="" height="calc(100vh - 300px)"
      max-height="calc(100vh - 300px)">
      <el-table-column type="selection" width="55" />
      <el-table-column label="操作用户" align="center" prop="opUserName" />
      <el-table-column label="操作IP"  align="center" prop="opIp" />
      <el-table-column label="异常类"  align="center" prop="opClass" />
      <el-table-column label="异常方法" prop="opMethod" />
      <el-table-column label="异常时间" prop="logTime" align="center"/>
      <el-table-column label="异常信息" align="center" >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handReadError(scope.row)">查看异常信息</el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column label="异常信息" prop="logContent" /> -->
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />  
    <el-dialog
      title="异常信息"
      :visible.sync="dialogVisible">
      <div style="max-height:60vh; overflow:auto">
        <p class="error-log">{{this.logContent}}</p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { 
  listByPageErrorLog,
  getReadErrorLog
} from '@/api/base/base'
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'errorUuid',
      list: null,
      total: 0,
      listLoading: false,
      dialogVisible: false,
      queryFields: [
        { label: '操作用户', name: 'opUserName', type: 'fuzzyText', value: '' },
        { label: '操作IP', name: 'opIp', type: 'fuzzyText' },
        { label: '异常类', name: 'opClass', type: 'fuzzyText' },
        { label: '异常方法', name: 'opMethod', type: 'fuzzyText' },
        { label: '日志时间区间', name: 'logTime', type: 'timePeriod' }
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
            headerName: '异常类',
            field: 'opClass',
            pinned: 'left'
          },
          {
            headerName: '异常方法',
            field: 'opMethod',
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: '异常时间',
            field: 'logTime',
            filter: 'agNumberColumnFilter'
          },
        ]
      },
      formStyle: {
        width: '700px',
        height: '400px'
      },
      temp: {
        errorUuid: '',
        opUserName: '',
        opUserId: '',
        opIp: '',
        opClass: '',
        opMethod: '',
        logContent: '',
        logTime: '',
        startTime: '',
        endTime: ''
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20
      }
    }
  },
  computed: {

  },
  created() {
    this.getList()
  },
  methods: {
    // /**
    //  * 格式化时间
    //  * @param row 指定行
    //  * @param column 指定列
    //  * @returns {string} 返回格式化后的时间
    //  */
    // dateFormatter(row, column) {
    //   const datetime = row.logTime
    //   if (datetime) {
    //     var dateMat = new Date(datetime)
    //     var year = dateMat.getFullYear()
    //     var month = dateMat.getMonth() + 1
    //     var day = dateMat.getDate()
    //     var hh = dateMat.getHours()
    //     var mm = dateMat.getMinutes()
    //     var ss = dateMat.getSeconds()
    //     var timeFormat = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
    //     return timeFormat
    //   }
    //   return ''
    // },
    /**
     * 获取列表
     * @param query 查询对象
     */
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
      }
      listByPageErrorLog(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    /**
     * 重置搜索条件
     */
    resetQuery() {
      this.query = {
        condition: {
          opUserName: '',
          opIp: '',
          opClass: '',
          opMethod: '',
          startTime: '',
          endTime: ''
        }
      }
    },
    /**
     * 获取详细异常信息 
     */
    handReadError(data){
      this.dialogVisible = true
      this.logContent = data.logContent
      // getReadErrorLog(data.errorUuid).then(res => {
      //   this.logContent = res.data
      // })
    },
  }
}
</script>
<style scoped>
.error-log{
  margin: 10px;
  line-height: 28px;
  font-size: 18px;

}
</style>