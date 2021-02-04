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
        <el-button type="primary" class="oper-btn pause" :disabled="stopStatus" title="停用" @click="handleStop()" />
        <el-button type="primary" class="oper-btn" icon="el-icon-document-copy" :disabled="selections.length !== 1" title="复制" @click="copyData()" />
        <el-button type="primary" class="oper-btn start" :disabled="runStatus" title="立即运行" @click="handleRun()" />
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
          style="display: inline-block;
          padding-left: 10px"
        >
          <el-button type="primary" class="oper-btn export" title="导入" />
        </el-upload>
        <span style="display: inline-block; padding-left: 10px">
          <el-button type="primary" class="oper-btn import" title="下载流程模板" @click="handleDown()" />
        </span>
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      style="width: 100%"
      height="calc(100vh - 300px)"
      max-height="calc(100vh - 300px)"
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
              <el-col :span="20">
                <label align="right">
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
        label="状态"
        width="100px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
      <el-table-column
        label="最近修改人"
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
        <el-row>
          <el-col :span="11">
            <el-form-item label="调度开始时间" prop="startTime">
              <el-date-picker
                v-model="temp.startTime"
                :picker-options="startTime"
                style="width:100%"
                type="date"
                props="startTime"
                :placeholder="disableUpdate === true ? '' : '请选择开始时间'"
                :disabled="disableUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="调度结束时间" prop="endTime">
              <!-- <el-col class="line" :span="1">-</el-col> -->
              <el-date-picker
                v-model="temp.endTime"
                :picker-options="endTime"
                type="date"
                prop="endTime"
                style="width:100%"
                :placeholder="disableUpdate === true ? '' : '请选择结束时间'"
                :disabled="disableUpdate"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <!-- 查询任务流程 -->
            <el-form-item label="任务流程" prop="processDefinitionId">
              <el-select
                v-model="temp.processDefinitionId"
                :disabled="disableUpdate"
                :filterable="true"
                style="width:100%"
                :remote="false"
                :remote-method="remoteMethod"
                reserve-keyword
                :placeholder="disableUpdate === true ? '' : '请选择任务流程'"
                :loading="loading"
                @change="changeProcess(temp.processDefinitionId)"
                @focus="remote-method"
              >
                <el-option
                  v-for="item in options"
                  :key="item.processDefinitionUuid"
                  :label="item.name"
                  :value="item.processDefinitionUuid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="作业周期" prop="crontab">
              <el-select
                v-model="temp.crontab"
                style="width:100%;"
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
          </el-col>
        </el-row>
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
        <el-form-item label="任务描述" prop="scheduleDesc">
          <el-input
            v-model="temp.scheduleDesc"
            :placeholder="disableUpdate === true ? '' : '请输入任务描述'"
            type="textarea"
            :disabled="disableUpdate"
          />
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
                      <!-- :class="{'oper-btn add': iconDisable}" -->
                      <span
                        v-if="!isLoading"
                        class="oper-btn add"
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
                    <span
                      :class="{'oper-btn delete': iconDisable}"
                      class="deleteIcon"
                      data-toggle="tooltip"
                      data-container="body"
                      title="删除所有依赖"
                      :style="{
                        'pointer-events': disableUpdate === true ? 'none' : '',
                      }"
                      style="cursor: pointer;"
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
      <el-form label-position="right" class="detail-form">
        <!-- 查询任务流程 -->
        <el-form-item label="任务流程" prop="downProcessDefinitionId">
          <el-select
            v-model="downProcessDefinitionId"
            :filterable="true"
            :remote="true"
            reserve-keyword
            placeholder="请选择任务流程"
            :remote-method="remoteMethod"
            :loading="loading"
            style="width:100%"
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
    <!-- 立即执行弹框 -->
    <el-dialog
      title="调度执行"
      :visible.sync="runDialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="runForm"
        :rules="runRules"
        label-position="right"
        class="detail-form"
        :model="runParams"
      >
        <el-form-item
          label="调度名称"
          prop="scheduleName"
        >
          <el-input
            v-model="runParams.scheduleName"
            :disabled="true"
          />
        </el-form-item>
        <el-row>
          <el-col :span="11">
            <el-form-item
              label="失败策略"
              prop="failureStrategyEnum"
            >
              <el-select
                v-model="runParams.failureStrategyEnum"
                placeholder="请选择选择失败策略"
                style="width:100%;"
              >
                <el-option
                  label="继续"
                  :value="'CONTINUE'"
                />
                <el-option
                  label="结束"
                  :value="'END'"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item
              label="优先级"
              prop="processInstancePriorityEnum"
            >
              <el-select
                v-model="runParams.processInstancePriorityEnum"
                style="width:100%;"
              >
                <el-option
                  v-for="(item,$index) in priorityList"
                  :key="$index"
                  :value="item.code"
                  :label="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item
          label="是否补数"
          prop="checked"
        >
          <el-checkbox v-model="runParams.checked">是</el-checkbox>
        </el-form-item>
        <el-form-item
          v-if="runParams.checked"
          label="执行方式"
          prop="runModeEnum"
        >
          <el-select
            v-model="runParams.runModeEnum"
            placeholder="请选择选择执行方式"
            style="width:100%"
          >
            <el-option
              label="串行执行"
              :value="'RUN_MODE_SERIAL'"
            />
            <el-option
              label="并行执行"
              :value="'RUN_MODE_PARALLEL'"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="runParams.checked"
          label="调度时间"
          prop="cronTime"
        >
          <el-date-picker
            v-model="runParams.cronTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width:100%"
          /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="runDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="runSchedule()">确 定</el-button>
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
  queryProcessLike,
  startProcessInstance
} from '@/api/etlscheduler/processschedule'
import { getById } from '@/api/etlscheduler/processdefinition'
import QueryField from '@/components/Ace/query-field/index'
// import { crontabExpression } from './common.js'
import { getDictList } from '@/utils'
import { mapMutations } from 'vuex'
import store from '@/store'

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
      store,
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
      runStatus: true,
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
        { label: '调度名称', name: 'scheduleName', type: 'text', value: '' },
        { label: '调度状态', name: 'status', type: 'select',
          data: [{ name: '启用', value: '1' }, { name: '停用', value: '0' }] },
        {
          label: '流程名称',
          name: 'processDefinitionId',
          type: 'select',
          data: []
        }
        // ,
        // { label: '模糊查询', name: 'keyword',
        //   type: 'fuzzyText'
        // }
      ],
      // 格式化参数列表
      formatMap: {
        status: {
          1: '启用',
          0: '停用',
          null: '停用'
        }
      },
      priorityList: [
        {
          code: 'HIGHEST',
          name: '最高'
        },
        {
          code: 'HIGH',
          name: '高'
        },
        {
          code: 'MEDIUM',
          name: '中'
        },
        {
          code: 'LOW',
          name: '低'
        },
        {
          code: 'LOWEST',
          name: '最低'
        }
      ],
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
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
      runParams: {
        scheduleName: null,
        checked: false,
        processScheduleUuid: null,
        // 失败策略
        failureStrategyEnum: 'CONTINUE',
        // 是否补数
        isSupply: null,
        // 执行方式
        commandTypeEnum: null,
        runModeEnum: 'RUN_MODE_SERIAL',
        // 流程优先级
        processInstancePriorityEnum: 'MEDIUM',
        // 调度时间字符串
        cronTime: ''
      },
      selections: [],
      dialogFormVisible: false,
      dialogFormVisible1: false,
      runDialogFormVisible: false,
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
          },
          { max: 100, message: '调度任务名称在100个字符之内', trigger: 'change' }
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
            message: '请选择作业周期',
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
            message: '请选择开始执行日期',
            trigger: 'change'
          }
        ],
        endTime: [
          {
            required: true,
            message: '请选择结束执行日期',
            trigger: 'change'
          }
        ],
        defaultValue: [
          {
            required: true,
            message: '请输入参数值',
            trigger: 'change'
          },
          { max: 50, message: '参数值在50个字符之内', trigger: 'change' }
        ]
      },
      runRules: {
        failureStrategyEnum: [
          {
            required: true,
            message: '请选择失败策略',
            trigger: 'change'
          }
        ],
        processInstancePriorityEnum: [
          {
            required: true,
            message: '请选择优先级',
            trigger: 'change'
          }
        ],
        cronTime: [
          {
            required: true,
            message: '请选择调度时间',
            trigger: 'change'
          }
        ],
        runModeEnum: [
          {
            required: true,
            message: '请选择执行方式',
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
        this.runStatus = true
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
        this.runStatus = true
      }
      if (this.selections.length === 1) {
        this.selections.forEach((r, i) => {
          if (r.status === 0) {
            this.editStatus = false
            this.runStatus = true
          } else if (r.status === 1) {
            this.editStatus = true
            this.runStatus = false
          }
        })
      }
    },
    dependTaskList(e) {
      if (this.dependTaskList === null || !this.dependTaskList.length > 0 || this.dependTaskList[0] === null) {
        this.isLoading = false
      } else if (this.dependTaskList !== null) {
        if (this.dependTaskList[0].dependItemList === null) {
          this.isLoading = false
        } else {
          this.isLoading = true
        }
      } else {
        this.isLoading = true
      }
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
    ...mapMutations('monitor', ['setScheduleDetail']),
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
      this.setScheduleDetail(true)
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
      if (this.downProcessDefinitionId === null || this.downProcessDefinitionId.trim().length === 0) {
        return
      }
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
            title: this.$t('message.title'),
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
        // this.isLoading = true
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
      if (query) {
        this.pageQuery.condition = query
        this.pageQuery.pageNo = 1
      }
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
    resetRunParams() {
      this.runParams = {
        checked: false,
        scheduleName: null,
        processScheduleUuid: null,
        // 失败策略
        failureStrategyEnum: 'CONTINUE',
        // 是否补数
        isSupply: null,
        // 执行方式
        commandTypeEnum: null,
        runModeEnum: 'RUN_MODE_SERIAL',
        // 流程优先级
        processInstancePriorityEnum: 'MEDIUM',
        // 调度时间字符串
        cronTime: ''
      }
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
    // 立即执行
    handleRun() {
      this.runDialogFormVisible = true
      this.resetRunParams()
      const temp = Object.assign({}, this.selections[0])
      this.runParams.scheduleName = temp.scheduleName
      this.runParams.processScheduleUuid = temp.processSchedulesUuid
      this.$nextTick(() => {
        this.$refs['runForm'].clearValidate()
      })
    },
    runSchedule() {
      this.$refs['runForm'].validate((valid) => {
        if (valid) {
          this.runParams.checked === true ? this.runParams.commandTypeEnum = 'COMPLEMENT_DATA' : this.runParams.commandTypeEnum = 'START_PROCESS'
          this.runParams.checked === true ? this.runParams.isSupply = true : this.runParams.isSupply = false
          this.runParams.cronTime ? this.runParams.cronTime = this.runParams.cronTime.join(',') : this.runParams.cronTime = ''
          const tempData = Object.assign({}, this.runParams)
          startProcessInstance(tempData).then(() => {
            this.getList()
            this.$notify({
              title: this.$t('message.title'),
              message: '运行成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
          this.runDialogFormVisible = false
        }
      })
    },
    // 新增
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
      this.setScheduleDetail(false)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (this.flag === false) {
          this.$notify({
            title: this.$t('message.title'),
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
                title: this.$t('message.title'),
                message: this.$t('message.insert.success'),
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
      this.setScheduleDetail(false)
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
          title: this.$t('message.title'),
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
                title: this.$t('message.title'),
                message: this.$t('message.update.success'),
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
      this.$confirm('此操作将删除相关的实例, 是否继续?', this.$t('confirm.title'), {
        confirmButtonText: this.$t('confirm.okBtn'),
        cancelButtonText: this.$t('confirm.cancelBtn'),
        type: 'warning'
      }).then(() => {
        var ids = []
        this.selections.forEach((r, i) => {
          ids.push(r.processSchedulesUuid)
        })
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
      }).catch(() => {
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
          title: this.$t('message.title'),
          message: '启用成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
    },
    // 停用
    handleStop() {
      this.$confirm('确定要停用吗？', this.$t('confirm.title'), {
        confirmButtonText: this.$t('confirm.okBtn'),
        cancelButtonText: this.$t('confirm.cancelBtn'),
        type: 'warning'
      }).then(() => {
        var ids = []
        this.selections.forEach((r, i) => {
          ids.push(r.processSchedulesUuid)
        })
        stopScheduleStatus(ids.join(','), 0).then(() => {
          this.getList()
          this.$notify({
            title: this.$t('message.title'),
            message: '停用成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      }).catch(() => {
      })
    },
    // 下载模板
    handleDown() {
      this.dialogFormVisible1 = true
      this.downProcessDefinitionId = null
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
      const loading = this.$loading({
        lock: true,
        // spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const index = this.file.name.lastIndexOf('.')
      const suffix = this.file.name.substr(index + 1)
      // 创建表单对象
      const formData = new FormData()
      // 后端接受参数 ，可以接受多个参数
      formData.append('schdeuleFile', this.file)
      formData.append('uploadFileName', 'git')
      formData.append('uploadFileContentType', suffix)
      var num = Math.random()
      axios({
        url: `/etlscheduler/schedules/importFiles?${num}`,
        method: 'post',
        data: formData
      }).then((res) => {
        if (res.data.code === 2501) {
          // this.$notify({
          //   title: this.$t('message.title'),
          //   message: res.data.msg,
          //   type: 'error',
          //   duration: 2000,
          //   position: 'bottom-right'
          // })
          this.$message({
            type: 'error',
            message: res.data.msg
          })
          loading.close()
        } else {
          this.getList()
          this.$notify({
            title: this.$t('message.title'),
            message: '导入成功',
            type: 'success',
            duration: 5000,
            position: 'bottom-right'
          })
          loading.close()
        }
      }).catch(() => {
        this.$notify({
          title: this.$t('message.title'),
          message: '导入调度时发生异常',
          type: 'error',
          duration: 2000,
          position: 'bottom-right'
        })
        loading.close()
      //   function(error) { // 请求失败处理
      //   this.$notify({
      //     title: this.$t('message.title'),
      //     message: '导入调度时发生异常',
      //     type: 'error',
      //     duration: 2000,
      //     position: 'bottom-right'
      //   })
      //   loading.close()
      })
    },
    // 格式化表格
    formatStatus(data) {
      return this.formatMap.status[data.status]
    },
    formatCron(row, column) {
      const date = row[column.property]
      var onJsonDate = new Date(row.startTime)
      var onTimeList = onJsonDate.toLocaleDateString().split('/')
      for (var i = 0; i < onTimeList.length; i++) {
        if (onTimeList[i] < 10) {
          onTimeList[i] = '0' + onTimeList[i]
        }
        var onTime = onTimeList[0] + '-' + onTimeList[1] + '-' + onTimeList[2]
      }
      var stopJsonDate = new Date(row.endTime)
      var stopTimeList = stopJsonDate.toLocaleDateString().split('/')
      for (var k = 0; k < stopTimeList.length; k++) {
        if (stopTimeList[k] < 10) {
          stopTimeList[k] = '0' + stopTimeList[k]
        }
        var stopTime = stopTimeList[0] + '-' + stopTimeList[1] + '-' + stopTimeList[2]
      }
      var message = ''
      this.crontabFormat.forEach((r, i) => {
        if (date === r.codeDesc) {
          message = r.codeName
        }
      })
      return onTime + '~' + stopTime + ' ' + message
    }
  }
}
</script>
<style scoped lang="scss" rel="stylesheet/scss">
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
  .el-popover{
    width: 60%;
    overflow: auto;
  }
  .m-depend-item-list{
    position: static;
  }
  // .deleteIcon{
    // position: relative;
    // left: 460px;
    // bottom: 115px;
  // }
</style>
