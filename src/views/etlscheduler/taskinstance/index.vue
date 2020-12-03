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
    <div class="etl-taskinstance-list">
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
      <!-- <el-table-column
        type="selection"
        align="center"
      /> -->
      <el-table-column
        label="运行状态"
        align="center"
        width="100px"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top" width="500">
            <p style="text-align:center" :style="{color: statusObj[scope.row.status].color}"><strong>{{ statusObj[scope.row.status].name }}</strong></p>
            <p style="text-align:center">点击查看日志</p>
            <div slot="reference" class="name-wrapper">
              <el-tag>
                <a target="_blank" class="buttonText" @click="handleTasksLogs(scope.row)">
                  <!-- 遍历statusList，更改不同状态的任务实例的图标和颜色 -->
                  <i
                    :class="statusObj[scope.row.status].unicode"
                    :style="{color: statusObj[scope.row.status].color}"
                    style="font-size:25px;font-weight:bold"
                  />
                </a>
              </el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="任务实例名称"
        width="150px"
        align="center"
        prop="name"
      />
      <el-table-column
        label="流程实例名称"
        width="150px"
        align="center"
        prop="processInstanceName"
      />
      <el-table-column
        label="任务类型"
        width="150px"
        align="center"
        prop="taskType"
      />
      <el-table-column
        label="任务参数"
        align="center"
        width="130px"
      >
        <template v-if="scope.row.taskParamList!=null && scope.row.taskParamList.length>0" slot-scope="scope">
          <!-- 任务参数使用图标进行显示 -->
          <el-popover trigger="hover" placement="top" width="500">
            <el-row v-for="taskParam in scope.row.taskParamList" :key="taskParam.value">
              <label class="col-md-2">
                {{ taskParam.name }}:
              </label>
              <div class="col-md-10">
                {{ taskParam.value }}
              </div>
            </el-row>
            <div slot="reference" class="name-wrapper">
              <el-link :underline="false" type="primary">查看参数</el-link>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="调度时间"
        width="200px"
        align="center"
        prop="scheduleTime"
      />
      <el-table-column
        label="开始运行时间"
        width="200px"
        align="center"
        prop="startTime"
      />
      <el-table-column
        label="结束运行时间"
        width="200px"
        align="center"
        prop="endTime"
      />
      <el-table-column
        label="共耗时"
        prop="time"
      />
    </el-table>
    </div>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
    <!-- 显示任务日志的dialog -->
    <el-dialog
      :visible.sync="logDialogFromVisible"
      :close-on-click-modal="false"
    >
      <el-col class="logtype">
        {{ task!=null ? task.name : null }}
      </el-col>
      <el-col v-if="task != null" class="logtype" style="font-size: 13px;color:#888888">
        耗时 {{ task != null ? task.time: 0+'秒' }}
      </el-col>
      <el-card style="padding-bottom: 3%;margin-top:10px">
        <!-- <el-col class="logtype">
          日志详情：
        </el-col> -->
        <el-col
          v-if="logs!=null"
          style="margin-top:10px"
        >
          <el-col
            v-for="log in logs[task.taskCode]"
            :key="log.taskLogUuid"
            :label="log.taskLogUuid"
            :style="{color: logColorObj[log.status].color}"
          >
            {{ log.logTime +' '+ log.logMessage }}
          </el-col>
        </el-col>
      </el-card>
      <div slot="footer">
        <el-button type="primary" @click="logDialogFromVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, findTaskLogs } from '@/api/etlscheduler/taskinstance'
import QueryField from '@/components/Ace/query-field/index'
// statuSelectList, statusComm
import { colorList, statusListComm, statuSelect } from '@/views/etlscheduler/processinstance/comm.js'

export default {
  components: { Pagination, QueryField },
  // filters: {
  // 耗时的时间格式转换
  // timeFilter(value) {
  //   const time = value
  //   if (time === null || time === '' || time === 0) {
  //     return 0 + '秒'
  //   } else {
  //     if (time / 1000 >= 0 && time / 1000 < 60) {
  //       return (time / 1000).toFixed(1) + '秒'
  //     } else if (time / 1000 >= 60 && time / 1000 < 3600) {
  //       return (time / 60000).toFixed(1) + '分'
  //     } else if (time / 1000 > 3600) {
  //       return (time / 3600000).toFixed(1) + '时'
  //     }
  //   }
  // },
  // statusFilter(value) {
  //   return (statusListComm || []).findIndex((item) => item.value === value)
  // }
  // },
  data() {
    return {
      tableKey: 'taskInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      queryDefault: {},
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '任务实例名称', name: 'name', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '任务实例状态', name: 'status', type: 'select',
          data: statuSelect
        },
        // {
        //   label: '任务实例状态', name: 'groupExecutionStatus', type: 'select',
        //   data: statuSelectList
        // },
        { label: '开始运行时间范围', name: 'startTime', type: 'timePeriod', value: '' }
      ],
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
        // 开始运行时间，倒序排序
        sortBy: 'desc',
        sortName: 'startTime'
      },
      temp: {
        keyword: null,
        id: null,
        name: null,
        taskType: null,
        processDefinitionId: null,
        processInstanceId: null,
        taskJson:	null,
        state: null,
        submitTime: null,
        startTime: null,
        endTime: null,
        host: null,
        executePath: null,
        logPath: null,
        alertFlag: null,
        retryTimes: null,
        pid: null,
        appLink: null,
        flag: null,
        retryInterval: null,
        maxRetryTimes: null,
        taskInstancePriority: null,
        workerGroup: null,
        executorId: null,
        taskInstanceUuid: null,
        taskCode: null,
        status: null,
        isDeleted: null,
        executorName: null,
        resources: null,
        executionStatus: null,
        time: null,
        processInstancePriority: null,
        dependentResult: null,
        processInstance1: null,
        processDefine: null,
        processInstanceName: null,
        params: null,
        scheduleTime: null
      },
      statusObj: {},
      logColorObj: {},
      selections: [],
      logDialogFromVisible: false,
      downloadLoading: false,
      tasks: null,
      checkedTask: null,
      checkedTaskId: '',
      logTasks: null,
      logs: null,
      taskslogsList: null,
      task: null,
      scTime: null
    }
  },
  watch: {
  },
  created() {
    statusListComm.forEach((r, i) => {
      this.statusObj[r['value']] = r
    })
    // statusComm.forEach((r, i) => {
    //   this.statusObj[r['value']] = r
    // })
    colorList.forEach((r, i) => {
      this.logColorObj[r['value']] = r
    })
    // this.select.startTimeStart = this.$route.params.startTimeStart
    // this.select.startTimeEnd = this.$route.params.startTimeEnd
    // this.select.status = this.$route.params.stateType
    // const condition = {
    //   startTimeStart: JSON.stringify(this.$route.query.startTimeStart),
    //   startTimeEnd: JSON.stringify(this.$route.query.startTimeEnd),
    //   status: JSON.stringify(this.$route.query.stateType)
    // }
    // console.log(condition)
    if (this.$route.params instanceof Object) {
      this.queryDefault = this.$route.params
    }
    // this.getList(this.queryDefault)

    this.getList()
  },
  mounted() {
    // this.statusList = statusListComm
  },
  methods: {
    // 根据状态查找该状态在数据中的下标
    statusFilter(value) {
      if (value == null || value.trim() === '') {
        return this.statusList.length
      }
      return (this.statusList || []).findIndex((item) => item.value === value)
    },
    colorFilter(value) {
      if (value == null || value.trim() === '') {
        return colorList.length
      }
      return (colorList || []).findIndex((item) => item.value === value)
      // if (!index2 || index2 === null || index2 < 0) {
      //   return colorList.length - 1
      // }
      // return index2 - 1
    },
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
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
    // 任务环节弹框显示
    handleTasksLogs(data) {
      // 获取任务日志
      this.task = data
      findTaskLogs(data.taskInstanceUuid).then(resp => {
        this.logs = resp.data
      })
      this.logDialogFromVisible = true
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
  .etl-taskinstance-list{
     height: 71.5%;
     overflow: auto;
  }

</style>
