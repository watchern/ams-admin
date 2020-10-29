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
    <div>
      <!-- 跳过指定环节 -->
      <el-button
        type="primary"
        title="跳过指定环节"
        :disabled="skipStatus"
        class="oper-btn"
        icon="el-icon-remove-outline"
        @click="handleSkipTask()"
      />
      <!-- 暂停 -->
      <el-button
        type="primary"
        title="暂停"
        :disabled="pusStatus"
        class="oper-btn"
        icon="el-icon-video-pause"
        @click="handleStop()"
      />
      <!-- 启动 -->
      <el-button
        type="primary"
        title="启动"
        class="oper-btn"
        icon="el-icon-video-play"
        :disabled="startStatus"
        @click="handleStart()"
      />
      <!-- 重新运行 -->
      <el-button
        type="primary"
        title="重新运行"
        class="oper-btn"
        icon="el-icon-refresh-left"
        :disabled="reStartStatus"
        @click="handleReStart()"
      />
      <!-- 取消 -->
      <el-button
        type="primary"
        title="取消"
        class="oper-btn"
        icon="el-icon-circle-close"
        :disabled="doneStatus"
        @click="handleCancel()"
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
      <el-table-column
        type="selection"
        align="center"
      />
      <el-table-column
        label="运行状态"
        align="center"
        width="80px"
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
        label="运行类型"
        width="120px"
        align="center"
        prop="commandType"
        :formatter="formatType"
      />
      <el-table-column
        label="流程实例名称"
        align="center"
        prop="name"
      />
      <el-table-column
        label="流程名称"
        width="130px"
        align="center"
        prop="processDefinitionName"
      />
      <!-- <el-table-column
        label="任务参数"
        align="center"
        width="80px"
      >
        <template slot-scope="scope">
           任务参数使用图标进行显示
          <el-popover trigger="hover" placement="top" width="700">
            <p>任务参数:{{ scope.row.taskParams }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag><i class="el-icon-tickets" /></el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column> -->
      <el-table-column
        label="调度时间"
        width="160px"
        align="center"
        prop="scheduleTime"
      />
      <el-table-column
        label="开始运行时间"
        width="160px"
        align="center"
        prop="startTime"
      />
      <el-table-column
        label="结束运行时间"
        width="160px"
        align="center"
        prop="endTime"
      />
      <el-table-column
        label="共耗时"
        width="100px"
        align="center"
        prop="timeConsum"
      />
      <el-table-column
        label="环节进度"
        width="100px"
        align="center"
        prop="schedule"
      />
      <el-table-column
        label="当前环节"
        width="120px"
        align="center"
        prop="nowTask"
      />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
    <!-- 跳过环节的dialog -->
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
    <!-- 显示任务日志的dialog -->
    <el-dialog
      :visible.sync="logDialogFromVisible"
    >
      <el-timeline style="margin-left:7%">
        <!-- 使用时间线任务实例的环节和运行的状态 -->
        <!-- 已运行的环节，改变颜色和图标 -->
        <el-timeline-item
          v-for="(task,$index) in logTasks"
          :key="task.id"
          class="logtype"
          :icon="taskslogsList[task.id] != null ? 'el-icon-more': null"
          :color="taskslogsList[task.id] != null ? '#0bbd87' : null"
          size="large"
        >
          <!-- value和name一致，默认展开 -->
          <el-collapse :value="task.id" style="width:85%;border:0;">
            <!-- title环节名称 -->
            <el-collapse-item :title="($index+1)+'/'+logTasks.length+'  '+task.name" :name="task.id">
              <el-card style="padding-bottom: 3%">
                <el-col v-if="taskslogsList[task.id] != null" class="logtype">
                  耗时： {{ taskslogsList[task.id] != null ? taskslogsList[task.id].time : 0+'秒' }}
                </el-col>
                <el-col
                  v-for="log in logs[task.id]"
                  :key="log.taskLogUuid"
                  :label="log.taskLogUuid"
                  :style="{color: logColorList[log.status===null ? 1 : log.status-1].color}"
                  style="margin-top:10px"
                >
                  {{ log.logTime +' '+ log.logMessage }}
                </el-col>
              </el-card>
            </el-collapse-item>
          </el-collapse>
        </el-timeline-item>
      </el-timeline>
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
  filters: {
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
      tableKey: 'processInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      queryDefault: {},
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '流程实例名称', name: 'name', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '流程状态', name: 'status', type: 'select',
          data: [{ name: '等待中', value: '1' },
            { name: '等待文件中', value: '2' },
            { name: '等待依赖任务', value: '3' },
            { name: '等待线程', value: '31' },
            { name: '执行中', value: '4' },
            { name: '暂停中', value: '5' },
            { name: '已取消', value: '6' },
            { name: '执行完成', value: '7' },
            { name: '执行失败', value: '8' },
            { name: '停止', value: '9' },
            { name: '提交成功', value: '40' },
            { name: '准备暂停', value: '50' },
            { name: '需要容错', value: '80' },
            { name: '准备停止', value: '90' }],
          default: '1'
        },
        { label: '开始运行时间范围', name: 'startTime', type: 'timePeriod', value: '' }
      ],
      // 格式化参数列表
      formatMap: {
        commandType: {
          0: '开启新流程',
          1: '从当前节点开启新流程',
          2: '重启容错流程',
          3: '重启补数流程',
          4: '从失败任务节点启动流程',
          5: '补数',
          6: '启动调度任务',
          7: '重复运行流程',
          8: '暂停流程',
          9: '停止流程',
          10: '重新运行等待线程流程',
          11: '超时',
          12: '启动',
          13: '重新运行',
          14: '取消',
          null: '其它'
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
          value: 31,
          name: '等待线程',
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
          value: 9,
          name: '停止',
          unicode: 'el-icon-video-pause',
          color: '#409eff'
        },
        {
          value: 80,
          name: '需要容错',
          unicode: 'el-icon-loading',
          color: '#333'
        },
        {
          value: 40,
          name: '提交成功',
          unicode: 'el-icon-loading',
          color: '#333'
        },
        {
          value: 50,
          name: '准备暂停',
          unicode: 'el-icon-loading',
          color: '#333'
        },
        {
          value: 90,
          name: '准备停止',
          unicode: 'el-icon-loading',
          color: '#333'
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
        processDefinitionName: null,
        schedule: null,
        nowTask: null
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
      pusStatus: true,
      startStatus: true,
      reStartStatus: true,
      doneStatus: true,
      logTasks: null,
      logs: null,
      taskslogsList: null,
      schedule: null,
      nowTask: null
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
              this.pusStatus = false
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
        this.pusStatus = false
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
            this.pusStatus = true
          }
        })
      } else {
        this.skipStatus = true
        this.startStatus = true
        this.pusStatus = true
        this.doneStatus = true
        this.reStartStatus = true
      }
    }
  },
  created() {
    if (this.$route.params instanceof Object) {
      this.queryDefault = this.$route.params
    }
    // this.getList(this.queryDefault)
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
    // 任务环节弹框显示
    handleTasksLogs(data) {
      if (data.processInstanceJson === null || data.processInstanceJson === '') {
        this.logDialogFromVisible = false
        return
      }
      // 获取任务环节
      getTaskLink(data.processInstanceUuid).then(resp => {
        this.logTasks = resp.data
      })
      // 获取任务日志
      findTaskLogs(data.processInstanceUuid).then(resp => {
        this.logs = resp.data
      })
      // 获取调度实例已运行的环节
      findTaskInstanceById(data.processInstanceUuid).then(resp => {
        this.taskslogsList = resp.data
      })
      this.logDialogFromVisible = true
    },
    // 跳过环节弹框显示
    handleSkipTask() {
      this.temp = Object.assign({}, this.selections[0])
      // 如果已有跳过的环节进行反写
      if (this.temp.skipInfo !== null && this.temp.skipInfo !== '') {
        var checkedTasks = JSON.parse(this.temp.skipInfo)
        this.checkedTask = checkedTasks[0]
        this.checkedTaskId = this.checkedTask.id
      }
      // 判断调度实例的json是否为空，为空的话，不显示弹框
      if (this.temp.processInstanceJson === null || this.temp.processInstanceJson === '') {
        this.dialogFormVisible = false
        return
      }
      // 获取任务环节
      getTaskLink(this.temp.processInstanceUuid).then(resp => {
        this.tasks = resp.data
      })
      this.dialogFormVisible = true
    },
    // 跳过环节
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
      // 更改跳过的环节
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
    // 重新运行
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
    // 取消
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
      return this.formatMap.commandType[data.commandType]
    }
    // ,
    // formatSchedule(data) {
    //   // 获取任务环节
    //   getTaskLink(data.processInstanceUuid).then(resp => {
    //     this.logTasks = resp.data
    //     // 获取调度实例已运行的环节
    //     findTaskInstanceById(data.processInstanceUuid).then(res => {
    //       this.taskslogsList = res.data
    //       if (this.taskslogsList !== null && this.logTasks !== null) {
    //         this.schedule = Object.keys(this.taskslogsList).length + '/' + this.logTasks.length
    //       }
    //     })
    //   })
    //   return this.schedule
    // },
    // formatTask(data) {
    //   // 获取调度实例已运行的环节
    //   findTaskInstanceById(data.processInstanceUuid).then(res => {
    //     this.taskslogsList = res.data
    //     if (this.taskslogsList !== null) {
    //       this.nowTask = Object.keys(this.taskslogsList).reverse()[0]
    //     }
    //   })
    //   return this.nowTask
    // }
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
