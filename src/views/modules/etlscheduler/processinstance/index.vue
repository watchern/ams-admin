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
        @click="handleCreate()"
      >跳过指定环节</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length !== 1"
        @click="handleUpdate()"
      >暂停</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length !== 1"
        @click="handleUpdate()"
      >启动</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length !== 1"
        @click="handleUpdate()"
      >重新运行</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleDelete()"
      >取消</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleDelete()"
      >批量删除</el-button>
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
        width="150px"
        align="center"
        prop="taskParams"
      />
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, del } from '@/api/etlscheduler/processinstance'
import { getById } from '@/api/etlscheduler/processdefinition'
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
        // { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
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
        }
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
          null: '未知'
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
      downloadLoading: false
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
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => { ids.push(r.processInstanceUuid) })
      del(ids.join(',')).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '删除成功',
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
    getProcessDefinitionName(processDefinitionUuid) {
      getById(processDefinitionUuid).then(resp => {
        this.processDefinitionName = resp.data.name
      })
    },
    // 格式化表格
    formatType(data) {
      return this.formatMap.execType[data.execType]
    },
    formatStatus(data) {
      return this.formatMap.status[data.status]
    },
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
