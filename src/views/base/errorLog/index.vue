<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <div style="height: 24px;"></div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      height="calc(100vh - 300px)"
      max-height="calc(100vh - 300px)"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="操作用户" width="100px" prop="opUserName" />
      <el-table-column label="操作IP" width="160px" align="center" prop="opIp" />
      <el-table-column label="异常类" prop="opClass" />
      <el-table-column label="异常方法" width="200px" prop="opMethod" />
      <el-table-column label="异常时间" width="300px" prop="logTime" align="center" />
      <el-table-column
        label="异常信息"
        width="300px"
        align="center"
      >
        <template slot-scope="scope">
          <a type="text" size="small" class="handreada" @click="handReadError(scope.row)">
            查看
          </a>
          <a type="text" size="small" class="handreada" @click="toExport(scope.row)">
            导出
          </a>
        </template>
      </el-table-column>
      <!-- <el-table-column label="异常信息" prop="logContent" /> -->
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog
      :append-to-body="true"
      title="异常信息"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
    >
      <div style="max-height:60vh;overflow:auto">
        <p class="error-log">{{ logerrortxt }}</p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {listByPageErrorLog} from '@/api/base/base'
import QueryField from '@/components/public/query-field/index'
import Pagination from '@/components/Pagination/index'
import axios from "axios";

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      logerrortxt: '',
      tableKey: 'errorUuid',
      list: null,
      total: 0,
      listLoading: false,
      dialogVisible: false,
      queryFields: [
        { label: '操作用户', name: 'opUserName', type: 'text', value: '' },
        { label: '操作IP', name: 'opIp', type: 'text' },
        { label: '异常类', name: 'opClass', type: 'text' },
        { label: '异常方法', name: 'opMethod', type: 'text' },
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
            filter: 'agDateColumnFilter'
          }
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
        condition: {},
        pageNo: 1,
        pageSize: 20,
        sortBy: 'desc',
        sortName: 'logTime'
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
    sortChange(data) {
      const { prop, order } = data;
      this.pageQuery.sortBy = order;
      this.pageQuery.sortName = prop;
      this.handleFilter();
    },
    /**
     * 当多选框改变时触发
     */
    handleSelectionChange(val) {
      this.selectValue = val
    },
    /**
     * 获取列表
     * @param query 查询对象
     */
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
        this.pageQuery.pageNo = 1
      }
      listByPageErrorLog(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    /**
     * 导出日志
     * @param rowData
     */
    toExport(rowData){
      const errorUuid = rowData.errorUuid;
      // window.location.href = "/base/logSysErrorController/export?errorUuid=" + errorUuid;

      axios.post("/base/logSysErrorController/export?errorUuid=" + errorUuid,
          { responseType: 'blob', headers: {
              'Content-Type': 'application/x-www-form-urlencoded' // 请求的数据类型为form data格式
            }}
      ).then((res) => {
        const filename = decodeURI(
            res.headers['content-disposition'].split(';')[1].split('=')[1]
        )
        const blob = new Blob([res.data], {
          type: 'text/plain'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
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
    handReadError(data) {
      this.dialogVisible = true
      this.logerrortxt = data.logContent
    }
  }
}
</script>
<style scoped>
.error-log{
  margin: 10px;
  line-height: 28px;
  font-size: 18px;
}
.handreada{
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    font-weight: 500;
    color: #1890ff;
}
.handreada:hover{text-decoration:underline}
</style>
