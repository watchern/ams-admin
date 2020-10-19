<template>
  <div class="list-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div>
      <el-button
        type="primary"
        size="mini"
        :disabled="skipStatus"
        class="oper-btn"
        icon="el-icon-remove-outline"
        @click="handleSkipTask()"
      />
      <!-- 跳过指定环节 -->
      <el-button
        type="primary"
        size="mini"
        :disabled="stopStatus"
        class="oper-btn"
        icon="el-icon-video-pause"
        @click="handleStop()"
      />
      <!-- 暂停 -->
      <el-button
        type="primary"
        size="mini"
        class="oper-btn"
        icon="el-icon-video-play"
        :disabled="startStatus"
        @click="handleStart()"
      />
      <!-- 启动 -->
      <el-button
        type="primary"
        size="mini"
        class="oper-btn"
        icon="el-icon-refresh-left"
        :disabled="reStartStatus"
        @click="handleReStart()"
      />
      <!-- 重新运行 -->
      <el-button
        type="danger"
        size="mini"
        class="oper-btn"
        icon="el-icon-circle-close"
        :disabled="doneStatus"
        @click="handleCancel()"
      />
      <!-- 取消 -->
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
        type="selection"
        align="center"
      />
      <!-- <el-table-column
        label="运行状态"
        width="150px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      /> -->
      <el-table-column
        label="运行状态"
        align="center"
        width="150px"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p style="text-align:center">{{ statusList[scope.row.status===null? 8 : scope.row.status-1].name }}</p>
            <p style="text-align:center">点击查看日志</p>
            <div slot="reference" class="name-wrapper">
              <el-tag>
                <a target="_blank" class="buttonText" @click="handleTasksLogs(scope.row)">
                  <i
                    :class="statusList[scope.row.status===null? 8 : scope.row.status-1].unicode"
                    :style="{color: statusList[scope.row.status===null? 8 : scope.row.status-1].color}"
                  />
                </a>
              </el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="执行方式"
        width="150px"
        align="center"
        prop="execType"
        :formatter="formatType"
      />
      <el-table-column
        label="流程实例名称"
        width="150px"
        align="center"
        prop="name"
      />
      <el-table-column
        label="流程名称"
        width="150px"
        align="center"
        prop="processDefinitionName"
      />
      <el-table-column
        label="任务参数"
        align="center"
        width="130px"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>任务参数:{{ scope.row.taskParams }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag><i class="el-icon-tickets" /></el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="开始运行时间"
        width="200px"
        align="center"
        prop="startTime"
      />
      <el-table-column
        label="停止运行时间"
        width="200px"
        align="center"
        prop="endTime"
      />
      <el-table-column
        label="共耗时"
        width="150px"
        align="center"
        prop="timeConsuming"
        :formatter="formatterTimeConsuming"
      />
      <el-table-column
        label="环节进度"
        width="150px"
        align="center"
        prop=""
      />
      <el-table-column
        label="当前环节状态"
        width="150px"
        align="center"
        prop=""
      />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
    <el-dialog
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        label-position="right"
        label-width="140px"
        class="detail-form"
        style="width: 700px; margin-left:50px;"
      >
        <el-radio-group v-model="checkedTaskId">
          <el-radio
            v-for="task in tasks"
            :key="task.id"
            :label="task.id"
            @change="changeSkipInfo"
          >{{ task.name }}</el-radio>
        </el-radio-group>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="taskSkip()"
        >确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="logDialogFromVisible"
    >
      <!-- <el-form
        ref="dataForm"
        label-position="right"
        label-width="140px"
        style="width: 700px; margin-left:50px;"
      >
        <el-row
          v-for="task in logTasks"
          :key="task.id"
          :label="task.id"
        >
          <el-col :span="6" class="logcol">
            {{ task.name }}
          </el-col>
          <el-col :span="15">
            <el-col class="logtype">
              {{ logsTime[task.id] != null ? '耗时：'+ logsTime[task.id].time/1000 + ' 秒': '' }}
            </el-col>
            <el-col
              v-for="log in logs[task.id]"
              :key="log.taskLogUuid"
              :label="log.taskLogUuid"
              class="red"
              :style="{color: logColorList[log.status===null ? 1 : log.status-1].color}"
              style="margin-top:10px"
            >
              {{ log.logTime +' '+ log.logMessage }}
            </el-col>
          </el-col>
        </el-row> -->
      <el-timeline style="margin-left:7%">
        <el-timeline-item
          v-for="task in logTasks"
          :key="task.id"
          class="logtype"
          :icon="logsTime[task.id] != null ? 'el-icon-more': null"
          :color="logsTime[task.id] != null ? '#0bbd87' : null"
          size="large"
        >
          <el-collapse :value="task.id" style="width:85%;border:0;">
            <el-collapse-item :title="task.name" :name="task.id">
              <el-card style="padding-bottom: 3%">
                <el-col class="logtype">
                  {{ logsTime[task.id] != null ? '耗时：'+ logsTime[task.id].time/1000 + ' 秒': '' }}
                </el-col>
                <el-col
                  v-for="log in logs[task.id]"
                  :key="log.taskLogUuid"
                  :label="log.taskLogUuid"
                  class="red"
                  :style="{color: logColorList[log.status===null ? 1 : log.status-1].color}"
                  style="margin-top:10px"
                >
                  {{ log.logTime +' '+ log.logMessage }}
                </el-col>
              </el-card>
            </el-collapse-item>
          </el-collapse>
          <!-- <el-card style="width:80%;padding-bottom:2%">
              <el-col class="logtype">
                {{ logsTime[task.id] != null ? '耗时：'+ logsTime[task.id].time/1000 + ' 秒': '' }}
              </el-col>
              <el-col
                v-for="log in logs[task.id]"
                :key="log.taskLogUuid"
                :label="log.taskLogUuid"
                class="red"
                :style="{color: logColorList[log.status===null ? 1 : log.status-1].color}"
                style="margin-top:10px"
              >
                {{ log.logTime +' '+ log.logMessage }}
              </el-col></el-card> -->
        </el-timeline-item>
      </el-timeline>
      <!-- </el-form> -->
      <div slot="footer">
        <el-button type="primary" @click="logDialogFromVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, skipTask, execute, getTaskLink, findTaskLogs, findTaskInstanceById } from '@/api/etlscheduler/processinstance'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'processInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '流程实例名称', name: 'name', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '流程状态', name: 'status', type: 'select',
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
      // 格式化参数列表
      formatMap: {
        execType: {
          1: '定时任务',
          2: '单次任务',
          3: '重跑',
          null: '其它'
        },
        status: {
          1: '等待中',
          2: '等待文件中',
          3: '等待依赖任务',
          4: '执行中',
          5: '暂停中',
          6: '已取消',
          7: '执行完成',
          8: '执行失败',
          null: '--'
        }
      },
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
          color: '#ff0000'
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
        sortBy: 'desc',
        sortName: 'startTime'
      },
      temp: {
        commandParam: null,
        commandStartTime: null,
        commandType: null,
        connects: null,
        createTime: null,
        dependenceScheduleTimes: null,
        endTime: null,
        execType: null,
        executorId: null,
        failureStrategy: null,
        flag: null,
        globalParams: null,
        historyCmd: null,
        host: null,
        isDeleted: null,
        isSkipNode: null,
        isSubProcess: null,
        isSupply: null,
        keyword: null,
        locations: null,
        maxTryTimes: null,
        name: null,
        processDefinitionUuid: null,
        processInstanceJson: null,
        processInstancePriority: null,
        processInstanceUuid: null,
        processScheduleUuid: null,
        recovery: null,
        runTimes: null,
        scheduleInfo: null,
        scheduleTime: null,
        skipInfo: null,
        startTime: null,
        state: null,
        status: null,
        taskDependType: null,
        taskParams: null,
        tenantId: null,
        timeConsuming: null,
        timeout: null,
        updateTime: null,
        updateUserName: null,
        updateUserUuid: null,
        versionNum: null,
        warningGroupId: null,
        warningType: null,
        workerGroup: null,
        processDefinitionName: null
      },
      selections: [],
      dialogFormVisible: false,
      logDialogFromVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      downloadLoading: false,
      tasks: null,
      checkedTask: null,
      checkedTaskId: '',
      skipStatus: true,
      stopStatus: true,
      startStatus: true,
      reStartStatus: true,
      doneStatus: true,
      logTasks: null,
      logs: null,
      logsTime: null
    }
  },
  watch: {
    selections() {
      // 终态数组
      const alreadyStatuses = [6, 7, 8]
      // 可以取消状态数组
      const waitStatuses = [1, 2, 3, 4, 5]
      // 执行和启用以外的状态
      const otherStatuses = [1, 2, 3, 6, 7, 8]
      // 选择1条数据
      if (this.selections.length === 1) {
        this.selections.forEach((r, i) => {
          // 判断是否为终态，如果是终态，跳过按钮不可用；否则可用
          if (alreadyStatuses.indexOf(r.status) < 0) {
            this.skipStatus = false
          }
          // 判断状态是否为等待中,如果是等待中，取消按钮可用
          if (waitStatuses.indexOf(r.status) >= 0) {
            this.doneStatus = false
          }
          switch (r.status) {
            // 判断状态是否为执行中,如果是执行中，暂停按钮可用
            case 4:
              this.stopStatus = false
              break
            // 判断状态是否为暂停中,如果是暂停中，执行按钮可用
            case 5:
              this.startStatus = false
              break
            // 判断状态是否为执行失败中,如果是执行失败中，重新运行按钮可用
            case 8:
              this.reStartStatus = false
              break
            default:
              break
          }
        })
      } else if (this.selections.length > 1) { // 选择多条数据
        // 跳过按钮禁用
        this.skipStatus = true
        // 其它按钮取消禁用
        this.startStatus = false
        this.stopStatus = false
        this.doneStatus = false
        this.reStartStatus = false
        this.selections.forEach((r, i) => {
          // 遍历选择的数组判断状态，如果是有状态不是等待状态的，取消按钮不可用
          if (waitStatuses.indexOf(r.status) < 0) {
            this.doneStatus = true
          }
          // 遍历选择的数组判断状态，如果是有状态不是执行失败的，重新执行按钮不可用
          if (r.status !== 8) {
            this.reStartStatus = true
          }
          // 遍历选择的数组判断状态，如果是有状态不是执行中的，启用按钮不可用
          if (r.status === 4 || otherStatuses.indexOf(r.status) >= 0) {
            this.startStatus = true
          }
          // 遍历选择的数组判断状态，如果是有状态不是暂停中的，启用按钮不可用
          if (r.status === 5 || otherStatuses.indexOf(r.status) >= 0) {
            this.stopStatus = true
          }
        })
      } else {
        this.skipStatus = true
        this.startStatus = true
        this.stopStatus = true
        this.doneStatus = true
        this.reStartStatus = true
      }
    }
  },
  created() {
    this.getList()
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
    handleTasksLogs(data) {
      if (data.processInstanceJson === null || data.processInstanceJson === '') {
        this.logDialogFromVisible = false
        return
      }
      getTaskLink(data.processInstanceUuid).then(resp => {
        this.logTasks = resp.data
      })
      findTaskLogs(data.processInstanceUuid).then(resp => {
        this.logs = resp.data
      })
      findTaskInstanceById(data.processInstanceUuid).then(resp => {
        this.logsTime = resp.data
      })
      this.logDialogFromVisible = true
    },
    // 跳过环节
    handleSkipTask() {
      this.temp = Object.assign({}, this.selections[0])
      // 如果已有跳过的环节进行反写
      if (this.temp.skipInfo !== null && this.temp.skipInfo !== '') {
        var checkedTasks = JSON.parse(this.temp.skipInfo)
        this.checkedTask = checkedTasks[0]
        this.checkedTaskId = this.checkedTask.id
      }
      if (this.temp.processInstanceJson === null || this.temp.processInstanceJson === '') {
        this.dialogFormVisible = false
        return
      }
      getTaskLink(this.temp.processInstanceUuid).then(resp => {
        this.tasks = resp.data
      })
      this.dialogFormVisible = true
    },
    taskSkip() {
      var checkedTasks = []
      checkedTasks.push(this.checkedTask)
      this.temp.skipInfo = JSON.stringify(checkedTasks)
      const tempData = Object.assign({}, this.temp)
      skipTask(tempData).then(() => {
        const index = this.list.findIndex(v => v.processInstanceUuid === this.temp.processInstanceUuid)
        this.list.splice(index, 1, this.temp)
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '设置跳过环节成功成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
      this.checkedTask = null
      this.checkedTaskId = null
      this.tasks = null
    },
    changeSkipInfo(a) {
      const index0 = this.tasks.findIndex(v => v.id === a)
      if (index0 > -1) {
        this.checkedTask = this.tasks[index0]
      }
    },
    // 暂停
    handleStop() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      execute(ids.join(','), 'TIME_OUT').then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '暂停成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 启动
    handleStart() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      execute(ids.join(','), 'START_UP').then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '启用成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleReStart() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      execute(ids.join(','), 'RE_START').then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '重新运行成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleCancel() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      execute(ids.join(','), 'CANCEL').then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '取消成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    // 格式化表格
    formatType(data) {
      return this.formatMap.execType[data.execType]
    },
    formatStatus(data) {
      return this.formatMap.status[data.status]
    },
    // 格式化时间
    formatterTimeConsuming(data) {
      const time = data.timeConsuming
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
	color: #888888;
  }

</style>
