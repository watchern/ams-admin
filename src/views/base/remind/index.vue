<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="标题"  align="center" prop="remindTitle" />
      <el-table-column label="内容"  align="left" prop="remindContent" />
      <el-table-column label="提醒时间"  align="center" prop="remindTime" :formatter="dateFormatter" />
      <el-table-column label="阅读状态" prop="readStatus" align="center"  :formatter="readStatusFormatter" />
      <el-table-column label="操作" prop="modeUrl" align="center" >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="selectDetail(scope.row)">查看</el-button>
          <el-button type="text" size="small" @click="signRead(scope.row)">标记已阅</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
  </div>
</template>
<script>
import { listByPageRemind, updateRemind } from '@/api/base/base'
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
      queryFields: [
        { label: '标题', name: 'remindTitle', type: 'fuzzyText', value: '' },
        { label: '内容', name: 'remindContent', type: 'fuzzyText' },
        { label: '提醒时间范围', name: 'remindTime', type: 'timePeriod' },
        { label: '阅读状态', name: 'readStatus', type: 'select',
          data: [{ name: '请选择', value: '-1' }, { name: '未阅', value: '0' }, { name: '已阅', value: '1' }], default: '-1' }
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
            headerName: '操作类型',
            field: 'opOperate',
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: '操作时间',
            field: 'opTime',
            filter: 'agNumberColumnFilter'
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
        remindUuid: '',
        remindTitle: '',
        remindContent: '',
        modeUrl: '',
        moduleName: '',
        remindUserUuid: '',
        remindUserName: '',
        remindTime: '',
        readStatus: '',
        remindedUserUuid: '',
        remindedUserName: '',
        remindedType: ''
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
    /**
     * 格式化时间字符串
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的字符串
     */
    dateFormatter(row, column) {
      const datetime = row.remindTime
      if (datetime) {
        var dateMat = new Date(datetime)
        var year = dateMat.getFullYear()
        var month = dateMat.getMonth() + 1
        var day = dateMat.getDate()
        var hh = dateMat.getHours()
        var mm = dateMat.getMinutes()
        var ss = dateMat.getSeconds()
        var timeFormat = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
        return timeFormat
      }
      return ''
    },
    /**
     * 格式化已阅状态
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的数据
     */
    readStatusFormatter(row, column) {
      var status = row.readStatus
      if (status == 0) {
        return '未阅'
      } else {
        return '已阅'
      }
    },
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
      }
      listByPageRemind(this.pageQuery).then(resp => {
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
          remindTitle: '',
          remindContent: '',
          remindTime: '',
          readStatus: ''
        }
      }
    },
    selectDetail(data) {
      var remindedType = data.remindedType
      var url = data.modeUrl
      this.$router.push({
        path: url
      })
    },
    signRead(data) {
      var obj = {
        remindUuid: data.remindUuid
      }
      updateRemind(obj).then(result => {
        if (result.code == 0) {
          this.getList()
        } else {
          this.$notify({ success: '失败', message: '标记已阅失败' })
        }
      })
    }
  }
}
</script>

