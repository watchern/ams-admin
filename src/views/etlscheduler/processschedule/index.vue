<template>
  <div class="page-container">
    <div class="filter-container">
      <!-- 查询条件区域 -->
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" class="oper-btn add" title="新增" @click="handleCreate()" />
        <el-button type="primary" class="oper-btn edit" :disabled="editStatus" title="修改" @click="handleUpdate()" />
        <el-button type="primary" class="oper-btn delete" :disabled="deleteStatus" title="删除" @click="handleDelete()" />
        <el-button type="primary" class="oper-btn start" :disabled="startStatus" title="启用" @click="handleUse()" />
        <el-button type="primary" class="oper-btn pause" :disabled="stopStatus" title="停用" @click="handleBear()" />
        <el-button type="primary" class="oper-btn" icon="el-icon-document-copy" :disabled="selections.length !== 1" title="复制" @click="copyData()" />
        <el-upload
          multiple
          class="upload-demo"
          action=""
          :on-remove="handleRemove"
          :headers="headers"
          :http-request="uploadFile"
          :limit="3"
          :auto-upload="true"
          :on-change="handleFileChange"
          :show-file-list="false"
          style="display: inline-block; padding-left: 10px"
        >
          <el-button type="primary" class="oper-btn export" title="导入" />
        </el-upload>
        <span style="display: inline-block; padding-left: 10px">
          <el-button type="primary" class="oper-btn import" title="下载流程模板" @click="dialogFormVisible1 = true" />
        </span>
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="调度任务名称"
        prop="scheduleName"
      >
        <template slot-scope="scope">
          <el-link target="_blank" :underline="false" type="primary" @click="getScheduleDetail(scope.row)">
            {{ scope.row.scheduleName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        v-if="false"
        label="任务流程"
        prop="processDefinitionId"
      />
      <el-table-column
        label="任务流程"
        prop="processDefName"
      />
      <el-table-column
        label="作业周期"
        prop="crontab"
        :formatter="formatCron"
      />
      <el-table-column
        label="参数"
        width="100px"
        align="center"
        prop="taskParamsList"
      >
        <template v-if="scope.row.distinctParamList!=null && scope.row.distinctParamList.length>0" slot-scope="scope">
          <el-popover trigger="hover" placement="top" width="500">
            <el-row v-for="(taskParam,$index) in scope.row.distinctParamList" :key="$index">
              <label class="col-md-4">
                {{ taskParam.name }}:
              </label>
              <div class="col-md-8">
                {{ taskParam.value }}
              </div>
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
              <label class="col-md-2">
                [{{ dependTask.dateValueName }}]
              </label>
              <label class="col-md-10" align="right">
                {{ dependTask.scheduleName }} - {{ dependTask.depTasksName }}
              </label>
            </el-row>
            <div slot="reference" class="name-wrapper">
              <!-- <el-tag><i class="el-icon-tickets" /></el-tag> -->
              <el-link :underline="false" type="primary">查看依赖环节</el-link>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        width="100px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
      <el-table-column
        label="最新修改人"
        width="150px"
        align="center"
        prop="updateUserName"
      />
      <el-table-column label="修改时间" align="center" prop="updateTime" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />

    <!-- 表单弹框 -->
    <!-- style="width: 700px; margin-left: 50px" -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        class="detail-form"
        label-position="right"
        style="height:62vh; overflow:auto;"
      >
        <el-form-item label="任务名称" prop="scheduleName">
          <el-input
            v-model="temp.scheduleName"
            :disabled="disableUpdate"
            :placeholder="disableUpdate === true ? '' : '请输入任务名称'"
          />
        </el-form-item>
        <!-- 查询任务流程 -->
        <el-form-item label="任务流程" prop="processDefinitionId">
          <el-select
            v-model="temp.processDefinitionId"
            :disabled="disableUpdate"
            :filterable="true"
            :remote="true"
            reserve-keyword
            :placeholder="disableUpdate === true ? '' : '请选择任务流程'"
            :remote-method="remoteMethod"
            :loading="loading"
            @change="changeProcess(temp.processDefinitionId)"
          >
            <el-option
              v-for="item in options"
              :key="item.processDefinitionUuid"
              :label="item.name"
              :value="item.processDefinitionUuid"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="(item, $index) in distinctParamList"
          :key="$index"
          :label="item.name"
          :rules="{required: true, message: '', trigger: 'change'}"
        >
          <el-input
            v-model="item.value"
            :disabled="disableUpdate"
            @blur="changeParamValue(item.value, item.name)"
          />
        </el-form-item>
        <el-form-item label="作业周期范围" prop="startTime">
          <el-col :span="8">
            <el-date-picker
              v-model="temp.startTime"
              :picker-options="startTime"
              type="date"
              prop="startTime"
              :placeholder="disableUpdate === true ? '' : '请选择开始时间'"
              :disabled="disableUpdate"
            />
          </el-col>
          <el-col class="line" :span="1">-</el-col>
          <el-col :span="8">
            <el-date-picker
              v-model="temp.endTime"
              :picker-options="endTime"
              type="date"
              :placeholder="disableUpdate === true ? '' : '请选择结束时间'"
              :disabled="disableUpdate"
            />
          </el-col>
        </el-form-item>

        <el-form-item label="作业周期" prop="crontab">
          <el-select
            v-model="temp.crontab"
            :placeholder="disableUpdate === true ? '' : '请选择作业周期'"
            :disabled="disableUpdate"
          >
            <el-option
              v-for="item in crontabFormat"
              :key="item.codeDesc"
              :label="item.codeName"
              :value="item.codeDesc"
            />
          </el-select>
        </el-form-item>
        <!-- 添加任务依赖 -->
        <!-- temp.dependTaskInfoList!=null && temp.dependTaskInfoList.length>0 && temp.dependTaskInfoList[0].dependItemList -->
        <!-- <el-form-item v-if="dialogStatus === 'create' || dialogStatus === 'update' || (dialogStatus === 'show' && temp.dependTaskInfoList && temp.dependTaskInfoList.length>0 && temp.dependTaskInfoList[0].dependItemList )"> -->
        <el-form-item
          v-if="dialogStatus !== 'show' || (temp.dependTaskInfoList && temp.dependTaskInfoList.length>0 && temp.dependTaskInfoList[0].dependItemList )"
        >
          <div class="dependence-model">
            <m-list-box>
              <div slot="content">
                <div>
                  <div slot="text">
                    <span class="el-form-item__label">调度任务依赖&nbsp;</span>
                    <a
                      :style="{
                        'pointer-events': disableUpdate === true ? 'none' : '',
                      }"
                      href="javascript:"
                      class="add-dep"
                      @click="!isDetails && _addDep()"
                    >
                      <em
                        v-if="!isLoading"
                        :class="{'oper-btn add': iconDisable}"
                        data-toggle="tooltip"
                        :disable="disableAddStatus"
                        title="添加"
                      />
                    </a>
                  </div>
                </div>
                <div class="dep-box">
                  <!-- :style="{
                      'pointer-events': disableUpdate === true ? 'none' : '',
                    }" -->
                  <span
                    v-if="dependTaskList!=null && dependTaskList.length>0"
                    @click="!isDetails && _setGlobalRelation()"
                  >
                    <!-- {{ relation === "AND" ? "且" : "或" }} -->
                  </span>
                  <div
                    v-for="(el, $index) in dependTaskList"
                    :key="$index"
                    :style="{
                      'pointer-events': disableUpdate === true ? 'none' : '',
                    }"
                  >
                    <span
                      v-if="el.dependItemList.length"
                      @click="!isDetails && _setRelation($index)"
                    >
                      <!-- {{ el.relation === "AND" ? "且" : "或" }} -->
                    </span>

                    <!-- :depend-item-list="dependTaskList[0].dependItemList" -->
                    <m-depend-item-list
                      v-model="el.dependItemList"
                      :index="$index"
                      :depend-task-list="dependTaskList"
                      :process-schedules-uuid="temp.processSchedulesUuid"
                      @on-delete-all="_onDeleteAll"
                      @getDependTaskList="getDependTaskList"
                    />
                    <em
                      :class="{'oper-btn delete': iconDisable}"
                      class="deleteIcon"
                      data-toggle="tooltip"
                      data-container="body"
                      title="删除"
                      :style="{
                        'pointer-events': disableUpdate === true ? 'none' : '',
                      }"
                      @click="!isDetails && _deleteDep($index)"
                    />
                  </div>
                </div>
              </div>
            </m-list-box>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          v-if="!closeStatus"
          @click="dialogFormVisible = false"
        >取消</el-button>
        <el-button
          v-if="closeStatus"
          type="primary"
          @click="dialogFormVisible = false"
        >关闭</el-button>
        <el-button
          v-if="!closeStatus"
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >保存</el-button>
      </div>
    </el-dialog>

    <!-- 下载流程模板弹框 -->
    <el-dialog title="下载流程模板" :visible.sync="dialogFormVisible1">
      <el-form
        :rules="rules"
        :model="temp"
        label-position="right"
      >
        <!-- 查询任务流程 -->
        <el-form-item label="任务流程" prop="processDefinitionId">
          <el-select
            v-model="downProcessDefinitionId"
            :filterable="true"
            :remote="true"
            reserve-keyword
            :placeholder="disableUpdate === true ? '' : '请选择任务流程'"
            :remote-method="remoteMethod"
            :loading="loading"
            class="propwidth"
            @change="changeTempProcess(temp.processDefinitionId)"
          >
            <el-option
              v-for="item in options"
              :key="item.processDefinitionUuid"
              :label="item.name"
              :value="item.processDefinitionUuid"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="exportFile()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import $ from 'jquery'
import _ from 'lodash'
import mListBox from './_source/listBox'
import mDependItemList from './_source/dependItemList'
import disabledState from '@/components/etl/mixin/disabledState'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import {
  listByPage,
  save,
  update,
  del,
  findByprocessDef,
  startScheduleStatus,
  stopScheduleStatus,
  getByScheduleId,
  copy,
  queryProcessLike
} from '@/api/etlscheduler/processschedule'
import { getById } from '@/api/etlscheduler/processdefinition'
import QueryField from '@/components/Ace/query-field/index'
// import { crontabExpression } from './common.js'
import { getDictList } from '@/utils'
// import _ from lodash

export default {
  name: 'Dependence',
  components: {
    Pagination,
    QueryField,
    mListBox,
    mDependItemList
  },
  mixins: [disabledState],
  props: {
    backfillItem: Object
  },
  data() {
    return {
      downProcessDefinitionId: null,
      disableAddStatus: false,
      // 开始时间大于今天
      startTime: {
        disabledDate: time => {
          if (this.temp.endTime) {
            return (
              time.getTime() > new Date(this.temp.endTime).getTime()
            )
          } else {
            // 86400000一天的毫秒数
            return time.getTime() < Date.now() - 86400000
          }
        }
      },
      endTime: {
        disabledDate: time => {
          if (this.temp.startTime) {
            return (
              time.getTime() < Date.now() ||
                time.getTime() < new Date(this.temp.startTime).getTime()
            )
          } else {
            // 86400000一天的毫秒数
            return time.getTime() < Date.now() - 86400000
          }
        }
      },
      disableUpdate: false,
      closeStatus: false,
      // 启用停用
      startStatus: true,
      stopStatus: true,
      editStatus: true,
      deleteStatus: true,
      // 添加依赖
      relation: 'AND',
      dependTaskList: [],
      paramList: [],
      distinctParamList: [],
      isLoading: false,
      flag: Boolean,
      //  查询任务流程
      options: [],
      // 依赖图标显示和隐藏
      iconDisable: true,
      processParam: {
        pageNo: 1,
        pageSize: 100,
        condition: {
          keyword: null
        }
      },
      // 作业周期格式化
      crontabFormat: null,
      loading: false,
      tableKey: 'processSchedulesUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '任务名称', name: 'scheduleName', type: 'text', value: '' },
        { label: '状态', name: 'status', type: 'select',
          data: [{ name: '启用', value: '1' }, { name: '停用', value: '0' }], default: '0' },
        {
          label: '流程名称',
          name: 'processDefinitionId',
          type: 'select',
          data: []
        },
        { label: '模糊查询', name: 'keyword',
          type: 'fuzzyText'
        }
      ],
      // 格式化参数列表
      formatMap: {
        status: {
          1: '启用',
          0: '停用',
          null: '停用'
        }
      },
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 10,
        sortBy: 'desc',
        sortName: 'updateTime'
      },
      temp: {
        startTime: null,
        endTime: null,
        taskParams: null,
        taskParamsList: null,
        dependTaskInfo: null,
        dependTaskInfoList: null,
        processInstancePriority: null,
        // status: 0,
        scheduleDesc: null,
        updateUserName: null,
        updateTime: null,
        crontab: null,
        scheduleName: null,
        processDefinitionId: null,
        processSchedulesUuid: null,
        processDefName: null
      },
      groupTime: {
        startTimeSpilt: null,
        endTimeSpilt: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogFormVisible1: false,
      dialogVisible2: false,
      dialogStatus: '',
      textMap: {
        update: '修改调度任务',
        create: '新增调度任务',
        show: '查看调度任务'
      },
      dialogPvVisible: false,
      headers: { 'Content-Type': 'multipart/form-data' },
      file: '',
      rules: {
        scheduleName: [
          {
            required: true,
            message: '请填写调度任务名称',
            trigger: 'change'
          }
        ],
        processDefName: [
          {
            required: true,
            message: '请输入参数值',
            trigger: 'change'
          }
        ],
        crontab: [
          {
            required: true,
            message: '请填写作业周期',
            trigger: 'change'
          }
        ],
        processDefinitionId: [
          {
            required: true,
            message: '请选择任务流程',
            trigger: 'change'
          }
        ],
        startTime: [
          {
            required: true,
            message: '请填写开始执行日期',
            trigger: 'change'
          }
        ],
        defaultValue: [
          {
            required: true,
            message: '请输入参数值',
            trigger: 'change'
          }
        ]
      },
      downloadLoading: false
    }
  },
  computed: {
    cacheDependence() {
      return {
        relation: this.relation,
        dependTaskList: _.map(this.dependTaskList, (v) => {
          return {
            relation: v.relation,
            dependItemList: _.map(v.dependItemList, (v1) =>
              _.omit(v1, ['depTasksList', 'state', 'dateValueList'])
            )
          }
        })
      }
    }
  },
  watch: {
    distinctParamList: {
      handler(val) {
        this.changeParamList(val)
      },
      // 这里是关键，代表递归监听 demo 的变化
      deep: true

    },
    // 监听selections集合
    selections() {
      if (this.selections.length > 0) {
        this.startStatus = false
        this.stopStatus = false
        this.editStatus = true
        this.selections.forEach((r, i) => {
          if (r.status === 1) {
            this.startStatus = true
            this.deleteStatus = true
          } else if (r.status === 0) {
            this.stopStatus = true
            this.deleteStatus = false
          }
        })
      } else {
        this.startStatus = true
        this.stopStatus = true
        this.editStatus = true
        this.deleteStatus = true
      }
      if (this.selections.length === 1) {
        this.selections.forEach((r, i) => {
          if (r.status === 0) {
            this.editStatus = false
          } else if (r.status === 1) {
            this.editStatus = true
          }
        })
      }
    },
    dependTaskList(e) {
      setTimeout(() => {
        this.isLoading = false
      }, 600)
    },
    cacheDependence(val) {
      this.$emit('on-cache-dependent', val)
    }
  },
  created() {
    try {
      this.crontabFormat = getDictList('001001')
    } catch (e) {
      console.error(e)
    }
    queryProcessLike().then((resp) => {
      this.queryFields[2].data = resp.data
    })
    this.getList()
    this.remoteMethod()
    const o = this.backfillItem
    const dependentResult = $(`#${o}`).data('dependent-result') || {}
    // Does not represent an empty object backfill
    if (!_.isEmpty(o)) {
      this.relation = _.cloneDeep(o.dependence.relation) || 'AND'
      this.dependTaskList = _.cloneDeep(o.dependence.dependTaskList) || []
      const defaultState = this.isDetails ? 'WAITING' : ''
      // Process instance return status display matches by key
      _.map(this.dependTaskList, (v) =>
        _.map(
          v.dependItemList,
          (v1) =>
            (v1.state =
                dependentResult[
                  `${v1.processSchedulesUuid}-${v1.depTasks}-${v1.cycle}-${v1.dateValue}-${v1.scheduleName}`
                ] || defaultState)
        )
      )
    }
  },
  methods: {
    // 修改参数
    changeParamValue(value, name) {
      if (value === '') {
        this.$message({
          message: '请为参数名称【' + name + '】赋值',
          type: 'warning'
        })
        this.flag = false
      } else {
        this.flag = true
      }
    },
    // 调度详情
    getScheduleDetail(rowdata) {
      this.distinctParamList = []
      this.iconDisable = false
      this.closeStatus = true
      this.disableUpdate = true
      this.temp = Object.assign({}, rowdata) // copy obj
      this.dialogStatus = 'show'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      getByScheduleId(this.temp.processSchedulesUuid).then((resp) => {
        this.temp = resp.data
        this.dependTaskList = resp.data.dependTaskInfoList === null ? [] : resp.data.dependTaskInfoList
        this.paramList = resp.data.taskParamsList === null ? [] : resp.data.taskParamsList
        this.distinctParamList = resp.data.distinctParamList === null ? [] : resp.data.distinctParamList
      })
    },
    // 导出 excel 格式
    exportFile() {
      var id = this.downProcessDefinitionId
      axios({
        method: 'get',
        url: `/etlscheduler/schedules/exportFile/${id}`,
        responseType: 'blob'
      }).then((res) => {
        const filename = decodeURI(
          res.headers['content-disposition'].split(';')[1].split('=')[1]
        )
        const blob = new Blob([res.data], {
          type: 'application/octet-stream'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        this.resetTemp()
      })
      this.dialogFormVisible1 = false
    },
    // 复制对象
    copyData() {
      this.selections.forEach((r, i) => {
        copy(r.processSchedulesUuid).then(() => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '复制成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      })
    },
    _addDep() {
      if (!this.isLoading) {
        this.isLoading = true
        if (this.dependTaskList == null || this.dependTaskList.length === 0) {
          this.disableAddStatus = false
          this.dependTaskList = [{
            dependItemList: [],
            relation: 'AND'
          }]
        } else {
          this.disableAddStatus = true
        }
      }
    },
    _deleteDep(i) {
      // remove index dependent
      this.dependTaskList.splice(i, 1)

      // remove tootip
      $('body').find('.tooltip.fade.top.in').remove()
    },
    _onDeleteAll(i) {
      this.dependTaskList.map((item, i) => {
        if (item.dependItemList.length === 0) {
          this.dependTaskList.splice(i, 1)
        }
      })
      // this._deleteDep(i)
    },
    _setGlobalRelation() {
      this.relation = this.relation === 'AND' ? 'OR' : 'AND'
    },
    getDependTaskList(i) {

    },
    _setRelation(i) {
      this.dependTaskList[i].relation === 'AND' ? 'OR' : 'AND'
    },
    _verification() {
      this.$emit('on-dependent', {
        relation: this.relation,
        dependTaskList: _.map(this.dependTaskList, (v) => {
          return {
            relation: v.relation,
            dependItemList: _.map(v.dependItemList, (v1) =>
              _.omit(v1, ['depTasksList', 'state', 'dateValueList'])
            )
          }
        })
      })
      return true
    },
    // 选择流程，改变参数
    changeProcess(processId) {
      // 查询单个流程
      getById(processId).then((res) => {
        this.temp.processDefName = res.data.name
        this.paramList = res.data.globalParamList
        // 去重
        this.distinctParamList = res.data.distinctParamList
      })
    },
    // 选择下载模板的流程
    changeTempProcess(data) {
      this.downProcessDefinitionId = data
      // getById(data).then((res) => {
      //   this.temp.processDefName = res.data.name
      // })
    },
    // 搜索任务流程
    remoteMethod(query) {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.processParam.condition.keyword = query
        findByprocessDef(this.processParam).then((resp) => {
          this.options = resp.data.records
        })
      }, 200)
    },
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then((resp) => {
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
    resetTemp() {
      this.temp = {
        scheduleName: null,
        processInstancePriority: null,
        scheduleDesc: null,
        crontab: null,
        processDefinitionId: null,
        processSchedulesUuid: null,
        status: null,
        updateUserName: null,
        updateTime: null,
        processDefName: null,
        taskParams: null,
        dependTaskInfo: null,
        dependTaskInfoList: null,
        taskParamsList: null,
        startTime: null,
        endTime: null
      }
    },
    handleCreate() {
      this.iconDisable = true
      this.disableUpdate = false
      this.closeStatus = false
      this.distinctParamList = []
      this.dependTaskList = []
      this._onDeleteAll()
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (this.flag === false) {
          this.$notify({
            title: '失败',
            message: '请输入参数值',
            type: 'error',
            duration: 3000,
            position: 'bottom-right'
          })
        } else {
          this.flag = true
          if (valid) {
            // this.temp.distinctParamList = this.distinctParamList
            this.temp.taskParamsList = this.paramList
            if (!this.dependTaskList.length) {
              this.temp.dependTaskInfo = null
              this.temp.dependTaskInfoList = []
            } else {
              this.temp.dependTaskInfoList = this.dependTaskList
              this.temp.dependTaskInfo = JSON.stringify(this.dependTaskList)
            }
            save(this.temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000,
                position: 'bottom-right'
              })
            })
          }
        }
      })
    },
    changeParamList(val) {
      var map = _.groupBy(val, 'paramCode')
      this.paramList.forEach(function(property) {
        property.value = map[property.paramCode][0].value
        property.param.defaultValue = map[property.paramCode][0].value
      })
    },
    // 修改
    handleUpdate() {
      this.iconDisable = true
      this.disableUpdate = false
      this.closeStatus = false
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      getByScheduleId(this.temp.processSchedulesUuid).then((resp) => {
        this.temp = resp.data
        this.dependTaskList = resp.data.dependTaskInfoList === null ? [] : resp.data.dependTaskInfoList
        this.paramList = resp.data.taskParamsList === null ? [] : resp.data.taskParamsList
        this.distinctParamList = resp.data.distinctParamList === null ? [] : resp.data.distinctParamList
      })
    },
    updateData() {
      if (this.flag === false) {
        this.$notify({
          title: '失败',
          message: '请输入参数值',
          type: 'error',
          duration: 3000,
          position: 'bottom-right'
        })
      } else {
        this.flag = true
        this.temp.dependTaskInfoList = this.dependTaskList
        this.temp.taskParamsList = this.paramList
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            update(tempData).then(() => {
              this.getList()
              const index = this.list.findIndex((v) => v.processSchedulesUuid === this.temp.processSchedulesUuid)
              this.list.splice(index, 1, this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000,
                position: 'bottom-right'
              })
            })
          }
        })
      }
    },
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => {
        ids.push(r.processSchedulesUuid)
      })
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
    handleUse() {
      var ids = []
      this.selections.forEach((r, i) => {
        ids.push(r.processSchedulesUuid)
      })
      startScheduleStatus(ids.join(','), 1).then((res) => {
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
    handleBear() {
      var ids = []
      this.selections.forEach((r, i) => {
        ids.push(r.processSchedulesUuid)
      })
      stopScheduleStatus(ids.join(','), 0).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '停用成功',
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
    // 上传文件，获取文件流
    handleFileChange(file) {
      // console.log(file)
      this.file = file.raw
    },
    handleRemove(file, fileList) {
      this.file = ''
    },
    beforeUpload(file) {},
    submitUpload() {
      if (this.file !== '') {
        this.$refs.uploadForm.submit()
      } else {
        this.$message({
          message: '请先选择文件!',
          type: 'warning',
          duration: '2000'
        })
      }
    },
    // 自定义上传
    uploadFile() {
      const index = this.file.name.lastIndexOf('.')
      const suffix = this.file.name.substr(index + 1)
      // 创建表单对象
      const formData = new FormData()
      // 后端接受参数 ，可以接受多个参数
      formData.append('schdeuleFile', this.file)
      formData.append('uploadFileName', 'git')
      formData.append('uploadFileContentType', suffix)
      axios({
        url: '/etlscheduler/schedules/importFiles',
        method: 'post',
        data: formData
      }).then((res) => {
        if (res.data.code === 2501) {
          this.getList()
          this.$notify({
            title: '失败',
            message: res.data.msg,
            type: 'error',
            duration: 2000,
            position: 'bottom-right'
          })
        } else {
          this.getList()
          this.$notify({
            title: '成功',
            message: '导入成功',
            type: 'success',
            duration: 5000,
            position: 'bottom-right'
          })
        }
      })
    },
    // 格式化表格
    formatStatus(data) {
      return this.formatMap.status[data.status]
    },
    formatCron(row, column) {
      const date = row[column.property]
      var onJsonDate = new Date(row.startTime)
      var onTime = onJsonDate.toLocaleDateString()
      var stopJsonDate = new Date(row.endTime)
      var stopTime = stopJsonDate.toLocaleDateString()
      var message = ''
      this.crontabFormat.forEach((r, i) => {
        if (date === r.codeDesc) {
          message = r.codeName
        }
      })
      return onTime + '-' + stopTime + ' ' + message
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
  .el-tag {
    background-color: transparent;
    border-color: transparent;
    color: #409eff;
    font-size: 22px;
    cursor: pointer;
  }
  .dependence-model {
    margin-top: -10px;

    .dep-opt {
      margin-bottom: 10px;
      padding-top: 3px;
      line-height: 24px;

      .add-dep {
        color: #0097e0;
        margin-right: 10px;

        i {
          font-size: 18px;
          vertical-align: middle;
        }
      }
    }

    .dep-list {
      margin-bottom: 16px;
      position: relative;
      border-left: 1px solid #eee;
      padding-left: 16px;
      margin-left: -16px;
      transition: all 0.2s ease-out;
      padding-bottom: 20px;

      &:hover {
        border-left: 1px solid #0097e0;
        transition: all 0.2s ease-out;

        .dep-line-pie {
          transition: all 0.2s ease-out;
          border: 1px solid #0097e0;
          background: #0097e0;
          color: #fff;
        }
      }

      .dep-line-pie {
        transition: all 0.2s ease-out;
        position: absolute;
        width: 20px;
        height: 20px;
        border: 1px solid #e2e2e2;
        text-align: center;
        top: 50%;
        margin-top: -20px;
        z-index: 1;
        left: -10px;
        border-radius: 10px;
        background: #fff;
        font-size: 12px;
        cursor: pointer;

        &::selection {
          background: transparent;
        }

        &::-moz-selection {
          background: transparent;
        }

        &::-webkit-selection {
          background: transparent;
        }
      }

      .dep-delete {
        position: absolute;
        bottom: -6px;
        left: 14px;
        font-size: 18px;
        color: #ff0000;
        cursor: pointer;
      }
    }

    .dep-box {
      // border-left: 4px solid #eee;
      // margin-left: -46px;
      // padding-left: 42px;
      position: relative;

      .dep-relation {
        position: absolute;
        width: 20px;
        height: 20px;
        border: 1px solid #e2e2e2;
        text-align: center;
        top: 50%;
        margin-top: -10px;
        z-index: 1;
        left: -12px;
        border-radius: 10px;
        background: #fff;
        font-size: 12px;
        cursor: pointer;

        &::selection {
          background: transparent;
        }

        &::-moz-selection {
          background: transparent;
        }

        &::-webkit-selection {
          background: transparent;
        }
      }
    }
  }
  .buttonText {
    color: #409eff;
  }
  .el-popover{
    width: 60%;
    overflow: auto;
  }
  .m-depend-item-list{
    position: static;

  }
  .deleteIcon{
    // position: relative;
    // left: 460px;
    // bottom: 115px;
  }
</style>
