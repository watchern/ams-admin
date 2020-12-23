<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" size="mini" class="oper-btn edit" title="标记已阅" @click="updateCode()" />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      height="calc(100vh - 300px)"
      max-height="calc(100vh - 300px)"
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column 
        label="标题" 
        prop="remindTitle" >
        <template slot-scope="scope">
          <el-link target="_blank" :underline="false" type="primary" class="handreada" @click="handdetails(scope.row)">
          {{ scope.row.remindTitle }}</el-link>
        </template>
      </el-table-column>
      <!-- <el-table-column label="内容"  align="left" prop="remindContent" /> -->
      <el-table-column label="提醒时间"  align="center" prop="remindTime"/>
      <el-table-column label="阅读状态" prop="readStatus" align="center"  :formatter="readStatusFormatter" />
      <!-- <el-table-column label="操作" prop="modeUrl" align="center" >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="selectDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog 
      :visible.sync="dialogFormVisible" 
      top = "10vh"
      title="消息详情"
      width="50%"
      :before-close="handleClose"
      v-model="temp"
      >
      <span class="visible-span">消息标题</span>
      <p class="visible-p1">{{this.temp.remindTitle}}</p>
      <span class="visible-span">消息内容</span>
      <p class="visible-p2">{{this.temp.remindContent}}</p>
    </el-dialog>
  </div>
</template>
<script>
import { listByPageRemind, updateRemind, updateReminds} from '@/api/base/base'
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
        //{ label: '内容', name: 'remindContent', type: 'fuzzyText' },
        { label: '提醒时间范围', name: 'remindTime', type: 'timePeriod' },
        { label: '阅读状态', name: 'readStatus', type: 'select',
          data: [{ name: '未阅', value: '0' }, { name: '已阅', value: '1' }], default: '-1' }
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
      selections: [],
      dialogFormVisible: false,
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
    //  * 格式化时间字符串
    //  * @param row 行数据
    //  * @param column 列数据
    //  * @returns {string} 返回格式化后的字符串
    //  */
    // dateFormatter(row, column) {
    //   const datetime = row.remindTime
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
        this.pageQuery.pageNo = 1
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
    updateCode(){
      var ids = []
      this.selections.forEach((r, i) => {
        ids.push(r.remindUuid)})
      console.log(ids)
      updateReminds(ids).then(result =>{
         if (result.code == 0) {
          this.getList()
        } else {
          this.$notify({ success: '失败', message: '标记已阅失败' })
        }
      })
    },
    handdetails(data){
    if(data.modeUrl != null){
      this.selectDetail(data)
    }else{
      this.temp = data
      this.dialogFormVisible = true
      updateRemind(data).then(result =>{
         if (result.code == 0) {
          this.getList()
        } else {
          this.$notify({ success: '失败', message: '标记已阅失败' })
        }
      })
      }
    }
  }
}
</script>
<style scoped>
.handreada{
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    font-weight: 500;
    color: #1890ff;
}
.handreada:hover{text-decoration:underline}
.visible-span{
  width: 95%;
  margin: 2.5% 2.5% .5%;
  display: inline-block;
  font-size: 24px;
}
.visible-p1{
  width: 95%;
  margin:.5% 2.5% 2.5%;
  padding: 10px;
  border: 1px solid #ddfdff;
  font-size: 16px;border-radius: 6px; 
  display: inline-block;
  height: 40px;
  overflow: auto;
}
.visible-p2{
  width: 95%;
  margin:.5% 2.5% 2.5%;
  padding: 10px;
  border: 1px solid #ddfdff;
  font-size: 16px;border-radius: 6px; 
  display: inline-block;
  line-height: 27px;
  height: 400px;
  overflow: auto;
}
</style>