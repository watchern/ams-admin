<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        :query-default="queryDefault"
        @submit="getList"
      />
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
          <el-popover trigger="hover" placement="top">
            <p style="text-align:center">{{ statusList[scope.row.status===null? statusList.length-1 : scope.row.status-1].name }}</p>
            <p style="text-align:center">点击查看日志</p>
            <div slot="reference" class="name-wrapper">
              <el-tag>
                <a target="_blank" class="buttonText" @click="handleTasksLogs(scope.row)">
                  <!-- 遍历statusList，更改不同状态的任务实例的图标和颜色 -->
                  <i
                    :class="statusList[scope.row.status===null? statusList.length-1 : scope.row.status-1].unicode"
                    :style="{color: statusList[scope.row.status===null? statusList.length-1 : scope.row.status-1].color}"
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
        <template slot-scope="scope">
          <!-- 任务参数使用图标进行显示 -->
          <el-popover trigger="hover" placement="top" width="700">
            <p width="50vw">任务参数:{{ scope.row.params }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag><i class="el-icon-tickets" /></el-tag>
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
        align="center"
        prop="time"
      >
        <template slot-scope="scope">
          {{ scope.row.time | timeFilter }}
        </template></el-table-column>
    </el-table>
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
    >
      <el-col class="logtype">
        {{ task!=null ? task.name : null }}
      </el-col>
      <el-col v-if="task != null" class="logtype" style="font-size: 13px;">
        耗时 {{ task != null ? task.time: 0 | timeFilter }}
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
            class="logtype"
            :style="{color: logColorList[log.status===null ? 1 : log.status-1].color}"
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

export default {
  components: { Pagination, QueryField },
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
          data: [{ name: '等待中', value: '1' },
            { name: '等待文件中', value: '2' },
            { name: '等待依赖任务', value: '3' },
            { name: '执行中', value: '4' },
            { name: '暂停中', value: '5' },
            { name: '已取消', value: '6' },
            { name: '执行完成', value: '7' },
            { name: '执行失败', value: '8' }],
          default: '1'
        },
        { label: '开始运行时间范围', name: 'startTime', type: 'timePeriod', value: '' }
      ],
      statusList: [
        {
          value: 1,
          name: '等待中',
          unicode: 'el-icon-s-help',
          color: '#f9be0a'
        },
        {
          value: 2,
          name: '等待文件中',
          unicode: 'el-icon-document',
          color: '#f9be0a'
        },
        {
          value: 3,
          name: '等待依赖任务',
          unicode: 'el-icon-share',
          color: '#f9be0a'
        },
        {
          value: 4,
          name: '执行中',
          unicode: 'el-icon-loading',
          color: '#333'
        },
        {
          value: 5,
          name: '暂停中',
          unicode: 'el-icon-video-pause',
          color: '#409eff'
        },
        {
          value: 6,
          name: '已取消',
          unicode: 'el-icon-circle-close',
          color: '#666666'
        },
        {
          value: 7,
          name: '执行完成',
          unicode: 'el-icon-finished',
          color: '#95F204'
        },
        {
          value: 8,
          name: '执行失败',
          unicode: 'el-icon-error',
          color: 'red'
        },
        {
          value: null,
          name: '--',
          unicode: 'el-icon-remove-outline',
          color: '#888888'
        }
      ],
      logColorList: [
        { value: '成功', color: '#008000' },
        { value: '失败', color: 'red' },
        { value: '警告', color: '#f9be0a' },
        { value: '其它', color: '#888888' }
      ],
      pageQuery: {
        condition: null,
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
    this.getList(this.queryDefault)
  },
  methods: {
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
      console.log(this.task)
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

</style>
