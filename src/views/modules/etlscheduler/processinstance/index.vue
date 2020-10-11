<template>
  <div class="app-container">
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
        @click="handleSkipTask()"
      >跳过指定环节</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="stopStatus"
        @click="handleStop()"
      >暂停</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="startStatus"
        @click="handleStart()"
      >启动</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="reStartStatus"
        @click="handleReStart()"
      >重新运行</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="doneStatus"
        @click="handleDone()"
      >取消</el-button>
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
        width="150px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
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
        style="width: 700px; margin-left:50px;"
      >
        <el-checkbox-group
          v-model="checkedTask"
        >
          <el-radio-group v-model="checkedTask">
            <el-radio v-for="task in tasks" :key="task.id" :label="task">{{ task.name }}</el-radio>
          </el-radio-group>
        </el-checkbox-group></el-form>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="taskSkip()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, update, stopInstance, startInstance } from '@/api/etlscheduler/processinstance'
import { getTaskLink } from '@/api/etlscheduler/processschedule'
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
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
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
      dialogStatus: '',
      dialogPvVisible: false,
      downloadLoading: false,
      tasks: null,
      checkedTask: {},
      skipStatus: true,
      stopStatus: true,
      startStatus: true,
      reStartStatus: true,
      doneStatus: true
    }
  },
  watch: {
    selections() {
      // 终态数组
      const alreadyStatuses = [6, 7, 8]
      // 等待状态数组
      const waitStatuses = [1, 2, 3]
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
    // 跳过环节
    handleSkipTask() {
      this.temp = Object.assign({}, this.selections[0])
      getTaskLink(this.temp.processDefinitionUuid).then(resp => {
        this.tasks = resp.data
      })
      this.dialogFormVisible = true
    },
    taskSkip() {
      this.temp.skipInfo = JSON.stringify(this.checkedTask)
      this.temp.isSkipNode = 1
      const tempData = Object.assign({}, this.temp)
      update(tempData).then(() => {
        const index = this.list.findIndex(v => v.processDefinitionUuid === this.temp.processDefinitionUuid)
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
    },
    // 暂停
    handleStop() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      stopInstance(ids.join(',')).then(() => {
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
      startInstance(ids.join(',')).then(() => {
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
</style>
