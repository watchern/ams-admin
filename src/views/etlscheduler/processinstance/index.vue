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
    <el-row>
      <el-col align="right">
        <!-- 跳过指定环节 -->
        <el-button
          type="primary"
          title="跳过指定环节"
          :disabled="skipStatus"
          class="oper-btn"
          icon="el-icon-remove-outline"
          @click="handleSkipTask()"
        />
        <!-- 修改 -->
        <el-button
          type="primary"
          class="oper-btn edit"
          title="修改"
          :disabled="selections.length !== 1 || reStartStatus"
          @click="handleUpdate()"
        />
        <!-- 暂停 -->
        <el-button
          type="primary"
          title="暂停"
          :disabled="pusStatus"
          class="oper-btn pause"
          @click="handleStop()"
        />
        <!-- 启动 -->
        <el-button
          type="primary"
          title="恢复暂停的流程"
          class="oper-btn start"
          :disabled="startStatus"
          @click="handleStart()"
        />
        <!-- 失败的恢复 -->
        <el-button
          type="primary"
          title="失败流程从失败任务节点启动"
          class="oper-btn start"
          :disabled="failStatus"
          @click="handleFailStart()"
        />
        <!-- 重新运行 -->
        <el-button
          type="primary"
          title="重新运行"
          class="oper-btn refresh"
          :disabled="reStartStatus"
          @click="handleReStart()"
        />
        <!-- 取消 -->
        <el-button
          type="primary"
          title="取消"
          class="oper-btn cancel"
          :disabled="doneStatus"
          @click="handleCancel()"
        />
        <!-- 删除 -->
        <el-button type="primary" class="oper-btn delete" title="删除" :disabled="selections.length === 0" @click="handleDelete()" />
      </el-col>
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
      height="calc(100vh - 350px)"
      max-height="calc(100vh - 350px)"
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
          <el-popover trigger="hover" placement="top" width="200">
            <p style="text-align:center" :style="{color: statusObj[scope.row.status].color}"><strong>{{ statusObj[scope.row.status].name }}</strong></p>
            <p style="text-align:center">点击查看日志</p>
            <div slot="reference" class="name-wrapper">
              <el-tag>
                <a target="_blank" @click="handleTasksLogs(scope.row)">
                  <!-- 遍历statusList，更改不同状态的任务实例的图标和颜色-->
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
        label="运行类型"
        width="120px"
        align="center"
        prop="commandType"
        :formatter="formatType"
      />
      <el-table-column
        label="流程实例名称"
        prop="name"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span class="tablespan" @click="handleView(scope.row.processInstanceUuid)">{{ scope.row.name }}</span>
          <!-- <el-link target="_blank" :underline="false" type="primary" @click="handleView(scope.row.processInstanceUuid)">{{ scope.row.name }}</el-link> -->
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="流程名称"
        width="130px"
        align="center"
        prop="processDefinitionName"
      /> -->
      <el-table-column
        label="任务参数"
        align="center"
        width="80px"
      >
        <template v-if="scope.row.distinctParamList!=null && scope.row.distinctParamList.length>0" slot-scope="scope">
          <!-- 任务参数使用图标进行显示 -->
          <el-popover trigger="hover" placement="top" width="500">
            <el-row v-for="taskParam in scope.row.distinctParamList" :key="taskParam.value">
              <el-col :span="8">
                <label>
                  {{ taskParam.name }}:
                </label>
              </el-col>
              <el-col :span="16">
                {{ taskParam.value }}
              </el-col>
            </el-row>
            <div slot="reference" class="name-wrapper">
              <!-- <el-tag><i class="el-icon-tickets" /></el-tag> -->
              <el-link :underline="false" type="primary">查看参数</el-link>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="依赖任务环节"
        align="center"
        prop="dependTaskInfo"
        width="120px"
      >
        <template v-if="scope.row.dependTaskInfoList!=null && scope.row.dependTaskInfoList.length>0 && scope.row.dependTaskInfoList[0].dependItemList" slot-scope="scope">
          <el-popover trigger="hover" placement="top" width="500">
            <el-row v-for="(dependTask,$index) in scope.row.dependTaskInfoList[0].dependItemList" :key="$index">
              <el-col :span="4">
                <label>
                  [{{ dependTask.dateValueName }}]
                </label>
              </el-col>
              <el-col :span="20" align="right">
                <label>
                  {{ dependTask.scheduleName }} - {{ dependTask.depTasksName }}
                </label>
              </el-col>
            </el-row>
            <div slot="reference" class="name-wrapper">
              <!-- <el-tag><i class="el-icon-tickets" /></el-tag> -->
              <el-link :underline="false" type="primary">查看依赖环节</el-link>
            </div>
          </el-popover>
        </template>
      </el-table-column>
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
      :close-on-click-modal="false"
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
        >保存</el-button>
      </div>
    </el-dialog>
    <!-- 指定环节重新运行的dialog -->
    <el-dialog
      :visible.sync="dialogRepeatFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        label-position="right"
        label-width="140px"
        class="detail-form"
        style="width: 700px; margin-left:50px;"
      >
        <el-radio-group v-model="repeatTaskId">
          <el-radio
            v-for="task in alreadyTasks"
            :key="task.taskInstanceUuid"
            :label="task.taskInstanceUuid"
          >{{ task.name }}</el-radio>
        </el-radio-group>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogRepeatFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="repeatInstance()"
        >确定</el-button>
      </div>
    </el-dialog>
    <!-- 显示任务日志的dialog -->
    <el-dialog
      :visible.sync="logDialogFromVisible"
      :close-on-click-modal="false"
    >
      <div style="max-height:60vh; overflow:auto;margin-top:3%;">
        <!-- value和name一致，默认展开 -->
        <el-collapse v-if="prepLogs!==null" value="pre" style="width:80%;border:0;margin-left:10%;">
          <!-- title环节名称 -->
          <el-collapse-item title="准备执行" name="pre">
            <el-card style="padding-bottom: 3%;">
              <!-- <el-col class="logtype">
                日志详情：
              </el-col> -->
              <el-col
                style="margin-top:10px"
              >
                <el-col
                  v-for="(log,$index) in prepLogs"
                  :key="$index"
                  :label="log.taskLogUuid"
                  :style="{color: logColorObj[log.status].color}"
                >
                  {{ log.logTime +' '+ log.logMessage }}
                </el-col>
              </el-col>
            </el-card>
          </el-collapse-item>
        </el-collapse>
        <el-timeline style="margin-left:10%;margin-top:7%">
          <!-- 使用时间线任务实例的环节和运行的状态 -->
          <!-- 已运行的环节，改变颜色和图标 -->
          <el-timeline-item
            v-for="(task,$index) in logTasks"
            :key="task.id"
            :icon="taskslogsList[task.id] != null && taskslogsList[task.id].flag === 1 ? statusObj[taskslogsList[task.id].status].unicode: null"
            :color="taskslogsList[task.id] != null && taskslogsList[task.id].flag === 1 ? statusObj[taskslogsList[task.id].status].color : null"
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
                    :style="{color: logColorObj[log.status].color}"
                    style="margin-top:10px"
                  >
                    {{ log.logTime +' '+ log.logMessage }}
                  </el-col>
                </el-card>
              </el-collapse-item>
            </el-collapse>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="logDialogFromVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, skipTask, execute, getTaskLink, findTaskLogs, findPrepLogs, findTaskInstanceById, del, repeatProcess } from '@/api/etlscheduler/processinstance'
import QueryField from '@/components/Ace/query-field/index'
// statuSelectList, statuSelect, statusComm
import { commandTypeObj, colorList, statusListComm, statuSelectList } from './comm.js'
import store from '@/store'
import _ from 'lodash'

export default {
  components: { Pagination, QueryField },
  props: {
    searchParams: Object
  },
  data() {
    return {
      store,
      tableKey: 'processInstanceUuid',
      list: null,
      total: 0,
      listLoading: false,
      queryDefault: {},
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '流程实例名称', name: 'name', type: 'text', value: '' },
        // { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        // {
        //   label: '流程状态', name: 'status', type: 'select',
        //   data: statuSelect
        // },
        {
          label: '运行状态', name: 'groupExecutionStatus', type: 'select',
          data: statuSelectList, value: []
        },
        { label: '开始运行时间', name: 'startTime', type: 'timePeriod', value: '' }
      ],
      // 格式化参数列表
      formatMap: {
        commandType: commandTypeObj
      },
      taskInstanceMap: {},
      statusObj: {},
      logColorObj: {},
      pageQuery: {
        condition: {},
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
      dialogRepeatFormVisible: false,
      dialogFormVisible: false,
      logDialogFromVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      downloadLoading: false,
      // 所有的环节
      tasks: null,
      // 已经运行的环节
      alreadyTasks: null,
      checkedTask: null,
      // 跳过环节的Id
      checkedTaskId: '',
      // 重新运行的环节的UUID
      repeatTaskId: '',
      skipStatus: true,
      pusStatus: true,
      startStatus: true,
      failStatus: true,
      reStartStatus: true,
      doneStatus: true,
      logTasks: null,
      logs: null,
      taskslogsList: null,
      taskInstances: null,
      schedule: null,
      nowTask: null,
      prepLogs: null
    }
  },
  watch: {
    // searchParams() {
    //   // this.store.state.monitor.processStartTime
    //   // startTimeStart: this.store.state.monitor.processStartTime,
    //   //   startTimeEnd: this.store.state.monitor.processEndTime
    //   this.queryDefault = {
    //     groupExecutionStatus: this.store.state.monitor.processGroupExecutionStatusType,
    //     startTimeStart: this.store.state.monitor.processStartTime,
    //     startTimeEnd: this.store.state.monitor.processEndTime
    //   }
    //   this.getList(this.queryDefault)
    // },
    searchParams: {
      deep: true,
      immediate: true,
      handler() {
        this.queryDefault = {
          groupExecutionStatus: this.store.state.monitor.processGroupExecutionStatusType,
          startTimeStart: this.store.state.monitor.processStartTime,
          startTimeEnd: this.store.state.monitor.processEndTime
          // startTimeStart: dayjs(this.store.state.monitor.processStartTime).format('YYYY-MM-DD'),
          // startTimeEnd: dayjs(this.store.state.monitor.processEndTime).format('YYYY-MM-DD')
        }
        this.queryFields[1].value = this.queryDefault.groupExecutionStatus
        this.queryFields[2].value = [this.queryDefault.startTimeStart, this.queryDefault.startTimeEnd]
        this.getList(this.queryDefault)
      }
    },
    selections() {
      // 终态数组
      const alreadyStatuses = [6, 7, 8]
      // 可以取消状态数组
      const waitStatuses = [2, 3, 4, 40]
      // 执行和启用以外的状态
      // const otherStatuses = [1, 2, 6, 7, 8, 40, 50, 80, 90]
      // 可以暂停的状态
      // const stopStatuses = [3, 4, 41, 32]
      const stopStatuses = [4, 41]
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
          // 判断状态是否在可以暂停的状态数组中
          if (stopStatuses.indexOf(r.status) >= 0) {
            this.pusStatus = false
          }
          switch (r.status) {
            // // 判断状态是否为执行中,如果是执行中，暂停按钮可用
            // case 4:
            //   this.pusStatus = false
            //   break
            // 判断状态是否为暂停中,如果是暂停中，执行按钮可用
            case 5:
              this.startStatus = false
              break
            case 7:
              this.reStartStatus = false
              break
            // 判断状态是否为执行失败中,如果是执行失败中，重新运行按钮可用，执行按钮可用，失败运行的执行按钮可用
            case 8:
              this.reStartStatus = false
              this.failStatus = false
              break
            default:
              break
          }
        })
      } else if (this.selections.length > 1) { // 选择多条数据
        // 跳过、重新运行按钮禁用
        this.skipStatus = true
        this.reStartStatus = true
        // 其它按钮取消禁用
        this.startStatus = false
        this.failStatus = false
        this.pusStatus = false
        this.doneStatus = false
        // this.reStartStatus = false
        this.selections.forEach((r, i) => {
          // 遍历选择的数组判断状态，如果是有状态不是等待状态的，取消按钮不可用
          if (waitStatuses.indexOf(r.status) < 0) {
            this.doneStatus = true
          }
          // 遍历选择的数组判断状态，如果是有状态不是执行失败的，重新执行按钮不可用，失败运行的执行按钮不可用
          if (r.status !== 8) {
            // this.reStartStatus = true
            this.failStatus = true
          }
          // 遍历选择的数组判断状态，如果是有状态不是执行中的，启用按钮不可用
          if (r.status !== 5) {
            this.startStatus = true
          }
          // 遍历选择的数组判断状态，如果是有状态不是暂停中的，停用按钮不可用
          if (stopStatuses.indexOf(r.status) < 0) {
            this.pusStatus = true
          }
        })
      } else {
        this.skipStatus = true
        this.startStatus = true
        this.failStatus = true
        this.pusStatus = true
        this.doneStatus = true
        this.reStartStatus = true
      }
    }
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
    // if (this.$route.params instanceof Object) {
    //   // this.queryDefault = this.$route.params
    //   this.queryDefault = { groupExecutionStatus: this.store.state.monitor.processGroupExecutionStatusType,
    //     startTimeStart: this.store.state.monitor.processStartTime,
    //     startTimeEnd: this.store.state.monitor.processEndTime }
    // }

    // this.queryDefault = {
    //   groupExecutionStatus: this.store.state.monitor.processGroupExecutionStatusType,
    //   startTimeStart: this.store.state.monitor.processStartTime,
    //   startTimeEnd: this.store.state.monitor.processEndTime }
    // this.getList(this.queryDefault)
    // this.getList()
  },
  methods: {
    colorFilter(value) {
      if (value == null || value.trim() === '') {
        return colorList.length
      }
      // const index1 = (colorList || []).findIndex((item) => item.value === value)
      // if (!index1 || index1 === null || index1 < 0) {
      //   return 1
      // }
      return (colorList || []).findIndex((item) => item.value === value)
    },
    getList(query) {
      console.log(query)
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
        this.pageQuery.pageNo = 1
      }
      listByPage(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleView(processInstanceUuid) {
      // 1为查看
      this.$router.push(`/etlscheduler/instance/${processInstanceUuid}/1`)
    },
    handleUpdate() {
      const temp = Object.assign({}, this.selections[0])
      this.$router.push(`/etlscheduler/instance/${temp.processInstanceUuid}/0`)
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
      getTaskLink(data.processInstanceUuid).then(res => {
        this.logTasks = res.data
        // 获取任务日志
        findTaskLogs(data.processInstanceUuid).then(respon => {
          this.logs = respon.data
        })
        // 获取调度实例已运行的环节
        findTaskInstanceById(data.processInstanceUuid).then(respons => {
          this.taskslogsList = respons.data
        })
      })
      // 获取非环节执行任务日志
      findPrepLogs(data.processInstanceUuid).then(respo => {
        this.prepLogs = respo.data
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
      this.temp.skipInfo = JSON.stringify([this.checkedTask])
      const tempData1 = {
        processInstanceUuid: this.temp.processInstanceUuid,
        skipInfo: this.temp.skipInfo
      }
      skipTask(tempData1).then(() => {
        const index = this.list.findIndex(v => v.processInstanceUuid === this.temp.processInstanceUuid)
        this.list.splice(index, 1, this.temp)
        this.dialogFormVisible = false
        this.$notify({
          title: this.$t('message.title'),
          message: '设置跳过环节成功成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
        this.tasks = null
      })
      this.checkedTask = null
      this.checkedTaskId = null
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
      execute(ids.join(','), 'PAUSE').then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: '暂停成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 暂停的启动
    handleStart() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      execute(ids.join(','), 'RECOVER_SUSPENDED_PROCESS').then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: '恢复运行成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 失败的启动
    handleFailStart() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      execute(ids.join(','), 'START_FAILURE_TASK_PROCESS').then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: '启用成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 重新运行
    handleReStart() {
      this.$confirm('是否指定环节重新运行?', this.$t('confirm.title'), {
        confirmButtonText: '指定',
        cancelButtonText: '不指定',
        type: 'warning'
      }).then(() => {
        this.repeatTaskId = ''
        this.temp = Object.assign({}, this.selections[0])
        // 如果已有跳过的环节进行反写
        if (this.temp.skipInfo !== null && this.temp.skipInfo !== '') {
          var checkedTasks = JSON.parse(this.temp.skipInfo)
          this.checkedTask = checkedTasks[0]
          this.checkedTaskId = this.checkedTask.id
        }
        // 判断调度实例的json是否为空，为空的话，不显示弹框
        if (this.temp.processInstanceJson === null || this.temp.processInstanceJson === '') {
          this.dialogRepeatFormVisible = false
          return
        }
        // 获取任务环节
        getTaskLink(this.temp.processInstanceUuid).then(resp => {
          // this.alreadyTasks = resp.data
          findTaskInstanceById(this.temp.processInstanceUuid).then(respons => {
            this.taskInstances = respons.data
            if (respons.data === null || respons.data === {} || respons.data === '') {
              this.dialogRepeatFormVisible = false
              return
            }
            resp.data.forEach((r, i) => {
              if (this.taskInstances[r.id]) {
                r.taskInstanceUuid = this.taskInstances[r.id].taskInstanceUuid
              }
            })
            this.alreadyTasks = _.filter(resp.data, x => x.taskInstanceUuid)
            this.dialogRepeatFormVisible = true
          })
        })
      }).catch(() => {
        var ids = []
        this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
        execute(ids.join(','), 'REPEAT_RUNNING').then(() => {
          this.getList()
          this.$notify({
            title: this.$t('message.title'),
            message: '重新运行成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      })
    },
    // 从指定环节重新运行
    repeatInstance() {
      const temp = Object.assign({}, this.selections[0])
      repeatProcess(temp.processInstanceUuid, this.repeatTaskId).then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: '指定环节重新运行成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
      this.dialogRepeatFormVisible = false
    },
    // 取消
    handleCancel() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      execute(ids.join(','), 'CANCEL').then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: '取消成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    handleDelete() {
      this.$confirm('此操作将删除相关的任务实例, 是否继续?', this.$t('confirm.title'), {
        confirmButtonText: this.$t('confirm.okBtn'),
        cancelButtonText: this.$t('confirm.cancelBtn'),
        type: 'warning'
      }).then(() => {
        var ids = []
        this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
        del(ids.join(',')).then(() => {
          this.getList()
          this.$notify({
            title: this.$t('message.title'),
            message: this.$t('message.delete.success'),
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      }).catch(() => { })
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
  .tablespan{
    color: #46a6ff;
    cursor: pointer;
  }
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
  .el-timeline-item__node--large {
	left: -2px;
	width: 20px !important;
	height: 20px !important;
  }
  .el-timeline-item__icon {
	color: #fff;
	font-size: 20px !important;
  }
</style>
