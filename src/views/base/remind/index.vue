<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" size="mini" class="oper-btn processing-1" :disabled="readButStatus" @click="updateCode()" />
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
        prop="remindTitle"
      >
        <template slot-scope="scope">
          <a
            type="text"
            size="small"
            :class="scope.row.readStatus === 1 ?'handreada' :'handreada-no'"
            @click="handdetails(scope.row)"
          >
            {{ scope.row.remindTitle }}
            <span
              v-if="scope.row.readStatus === 0"
              class="notRead"
            > NEW</span>
          </a>
        </template>
      </el-table-column>
      <el-table-column label="提醒时间" align="center" prop="remindTime" />
      <el-table-column label="阅读状态" prop="readStatus" align="center" :formatter="readStatusFormatter" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog
      v-model="temp"
      :append-to-body="true"
      :visible.sync="dialogFormVisible"
      top="10vh"
      title="消息详情"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-row>
        <el-col :span="24"><div class="visible-p1">
          {{ this.temp.remindTitle }}
        </div></el-col>
      </el-row>
      <el-divider />
      <el-row>
        <el-col :span="12"><div class="visible-p2">
          {{ this.temp.remindTime }}
        </div></el-col>
        <el-col :span="12"><div class="visible-p4">
          发送人：{{ this.temp.remindUserName }}
        </div></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><div class="visible-p3">
          {{ this.temp.remindContent }}
        </div></el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { listByPageRemind, updateRemind, updateReminds } from '@/api/base/base'
import QueryField from '@/components/public/query-field/index'
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
        { label: '标题', name: 'remindTitle', type: 'text', value: '' },
        // { label: '内容', name: 'remindContent', type: 'fuzzyText' },
        { label: '提醒时间范围', name: 'remindTime', type: 'timePeriod' },
        { label: '阅读状态', name: 'readStatus', type: 'select',
          data: [{ name: '未阅', value: '0' }, { name: '已阅', value: '1' }], default: '-1' }
      ],
      // selectedRowVal:0,
      tableOptions: {
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
      readButStatus: true,
      selections: [],
      dialogFormVisible: false,
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20
      }
    }
  },watch: {
    // 监听selections集合
    selections() {
      // 系统提醒已阅按钮 只有选择了未阅读的的消息时才可用
      this.readButStatus = this.selections.filter((r) => r.readStatus === 0).length === 0;
    }
  },
  computed: {

  },
  created() {
    this.getList()
  },
  methods: {
    /**
     * 格式化已阅状态
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的数据
     */
    readStatusFormatter(row, column) {
      var status = row.readStatus
      if (status === 0) {
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
          remindTitle: null,
          remindContent: null,
          remindTime: null,
          readStatus: null
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
    updateCode() {
      var ids = []
      this.selections.forEach((r, i) => {
        ids.push(r.remindUuid)
      })
      updateReminds(ids).then(result => {
        if (result.code === 0) {
          this.getList()
        } else {
          this.$notify({ success: '失败', message: '标记已阅失败' })
        }
      })
    },
    handdetails(data) {
      var id = data.remindUuid
      if (data.modeUrl == null || data.modeUrl == '') {
        this.temp = data
        this.dialogFormVisible = true
      } else {
        this.selectDetail(data)
      }
      if (data.readStatus === 0) {
        updateRemind(id).then(result => {
          if (result.code === 0) {
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
    font-weight: normal;
    color: #1890ff;
}
.handreada-no{
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    font-weight: bolder;
    color: #1890ff;
}
.notRead{
    text-align: left;
    padding: 0;
    font-size: 10px;
    font-weight: normal;
    color: red;
}
.handreada-no:hover{text-decoration:underline}
.handreada:hover{text-decoration:underline}
/*
  弹窗布局
*/
.visible-p1{
  text-align: center;
  width: 95%;
  margin:.5% 2.5% 0%;
  padding: 10px 0px;
  font-size: 25px;
  /* border-radius: 6px;  */
  display: inline-block;
  font-weight: bold;
}
.visible-p2{
  text-align: right;
  width: 95%;
  margin:.5% 2.5% .5%;
  padding: 5px;
  font-size: 16px;
  border-radius: 6px;
  display: inline-block;
}
.visible-p4{
  text-align: left;
  width: 95%;
  margin:.5% 2.5% .5%;
  padding: 5px;
  font-size: 16px;
  border-radius: 6px;
  display: inline-block;
}
.visible-p3{
  text-indent: 2em;
  width: 95%;
  margin:.5% 2.5% 2.5%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  display: inline-block;
  line-height: 27px;
  height: 400px;
  overflow: auto;
}
.red{
  font-weight: bold;
}
</style>
