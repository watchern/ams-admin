<template>
  <div class="page-container">
    <div class="filter-container">
      <!-- 查询条件区域 -->
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <!-- <div> -->
    <!-- <el-button type="primary" size="mini" @click="handleCreate()"
        >添加</el-button
      >
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length !== 1"
        @click="handleUpdate()"
        >修改</el-button
      >
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleDelete()"
        >删除</el-button
      > -->
    <div style="float: left;">
      <el-button type="primary" class="oper-btn add" @click="handleCreate()" title="添加" />
      <el-button type="primary" class="oper-btn edit" :disabled="selections.length !== 1" @click="handleUpdate()" title="修改" />
      <el-button type="primary" class="oper-btn delete" :disabled="selections.length === 0" @click="handleDelete()" title="删除" />
      <el-button type="primary" class="oper-btn" icon="el-icon-video-play" :disabled="startStatus" @click="handleUse()" title="启用" />
      <el-button type="primary" class="oper-btn" icon="el-icon-video-pause" :disabled="stopStatus" @click="handleBear()" title="停用" />
      <el-button type="primary" class="oper-btn" icon="el-icon-document-copy" :disabled="selections.length != 1" @click="copyData()" title="复制" />
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
        <el-button type="primary" class="oper-btn" icon="el-icon-upload2" title="导入">导入</el-button>
      </el-upload>
      <el-menu style="display: inline-block; padding-left: 10px">
        <el-button type="primary" class="oper-btn" icon="el-icon-download" @click="dialogFormVisible1 = true" title="下载流程模板"/>
      </el-menu>
    </div>
    <!-- <el-button
        type="primary"
        size="mini"
        :disabled="startStatus"
        @click="handleUse()"
        >启用</el-button
      >
      <el-button
        type="danger"
        size="mini"
        :disabled="stopStatus"
        @click="handleBear()"
        >禁用</el-button
      >
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length != 1"
        @click="copyData()"
        >复制</el-button
      > -->
    <!-- <el-upload
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
        <el-button size="mini" type="primary">导入</el-button>
      </el-upload> -->
    <!-- <el-menu style="display: inline-block; padding-left: 10px">
        <el-button type="primary" size="mini" @click="dialogFormVisible1 = true"
          >下载流程模板</el-button
        >
      </el-menu> -->
    <!-- </div> -->
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
        width="200px"
        align="center"
        prop="scheduleName"
      >
        <template slot-scope="scope">
          <a class="buttonText" @click="findSchedule(scope.row)">{{
            scope.row.scheduleName
          }}</a>
        </template>
      </el-table-column>
      <el-table-column
        v-if="false"
        label="任务流程"
        width="100px"
        align="center"
        prop="processDefinitionId"
      />
      <el-table-column
        label="任务流程"
        width="200px"
        align="center"
        prop="processDefName"
      />
      <el-table-column
        label="作业周期"
        align="center"
        prop="crontab"
        :formatter="formatCron"
      />
      <el-table-column
        label="参数"
        width="70px"
        align="center"
        prop="taskParamsList"
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
        label="依赖任务环节"
        align="center"
        prop="dependTaskInfo"
        width="120px"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>{{ scope.row.dependTaskInfo }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag><i class="el-icon-tickets" /></el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="排序号"
        width="80px"
        align="center"
        prop="processInstancePriority"
      />
      <el-table-column
        label="状态"
        width="100px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
      <el-table-column
        label="最新修改人"
        width="100px"
        align="center"
        prop="updateUserName"
      />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="200px" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
    <!-- style="width: 700px; margin-left: 50px" -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        class="detail-form"
        label-position="right"
        
      >
        <el-form-item label="任务名称" prop="scheduleName">
          <el-input
            v-model="temp.scheduleName"
            class="propwidth"
            placeholder="请输入任务名称"
            :disabled="disableUpdate"
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
            placeholder="请选择任务流程"
            :remote-method="remoteMethod"
            :loading="loading"
            class="propwidth"
            @change="paramMsg(temp.processDefinitionId)"
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
          v-for="item in distinctParamList"
          :key="item.paramUuid"
          :label="item.param.paramName"
          :prop="item.param.defaultValue"
        >
          <el-input
            v-model="item.param.defaultValue"
            class="propwidth"
            :disabled="disableUpdate"
          />
        </el-form-item>
        <el-form-item label="排序号" prop="processInstancePriority">
          <el-input
            v-model="temp.processInstancePriority"
            class="propwidth"
            placeholder="请输入排序号"
            :disabled="disableUpdate"
          />
        </el-form-item>
        <!-- <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="作业周期范围" prop="startTime">
          <el-col :span="11">
            <el-date-picker
              v-model="temp.startTime"
              :picker-options="startTime"
              type="date"
              prop="startTime"
              placeholder="选择日期"
              :disabled="disableUpdate"
            />
          </el-col>
          <el-col class="line" :span="1">-</el-col>
          <el-col :span="11">
            <el-date-picker
              v-model="temp.endTime"
              :picker-options="endTime"
              type="date"
              placeholder="选择日期"
              :disabled="disableUpdate"
            />
          </el-col>
        </el-form-item>

        <el-form-item label="作业周期" prop="crontab">
          <el-select
            v-model="temp.crontab"
            placeholder="请选择作业周期"
            class="propwidth"
            :disabled="disableUpdate"
          >
            <el-option
              v-for="item in crontabFormat"
              :key="item.code"
              :label="item.msg"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <!-- 添加任务依赖 -->
        <el-form-item label="添加依赖">
          <div class="dependence-model">
            <m-list-box>
              <!-- <div slot="text">添加依赖</div> -->
              <div slot="content">
                <div class="dep-opt">
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
                      class="ans-icon-increase"
                      :class="_isDetails"
                      data-toggle="tooltip"
                      title="添加"
                    />
                    <em
                      v-if="isLoading"
                      class="ans-icon-spinner2 as as-spin"
                      data-toggle="tooltip"
                      title="添加"
                    />
                  </a>
                </div>
                <div class="dep-box">
                  <span
                    v-if="dependTaskList.length"
                    :style="{
                      'pointer-events': disableUpdate === true ? 'none' : '',
                    }"
                    class="dep-relation"
                    @click="!isDetails && _setGlobalRelation()"
                  >
                    {{ relation === "AND" ? "且" : "或" }}
                  </span>
                  <div
                    v-for="(el, $index) in dependTaskList"
                    :key="$index"
                    :style="{
                      'pointer-events': disableUpdate === true ? 'none' : '',
                    }"
                    class="dep-list"
                  >
                    <span
                      v-if="el.dependItemList.length"
                      class="dep-line-pie"
                      @click="!isDetails && _setRelation($index)"
                    >
                      {{ el.relation === "AND" ? "且" : "或" }}
                    </span>
                    <em
                      class="ans-icon-trash dep-delete"
                      data-toggle="tooltip"
                      data-container="body"
                      :class="_isDetails"
                      title="删除"
                      :style="{
                        'pointer-events': disableUpdate === true ? 'none' : '',
                      }"
                      @click="!isDetails && _deleteDep($index)"
                    />
                    <m-depend-item-list
                      v-model="el.dependItemList"
                      :depend-item-list="dependTaskList"
                      :index="$index"
                      @on-delete-all="_onDeleteAll"
                      @getDependTaskList="getDependTaskList"
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
        >确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="下载流程模板" :visible.sync="dialogFormVisible1">
      <el-form
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="80px"
      >
        <!-- 查询任务流程 -->
        <el-form-item label="任务流程" prop="processDefinitionId">
          <el-select
            v-model="temp.processDefinitionId"
            :filterable="true"
            :remote="true"
            reserve-keyword
            placeholder="请选择任务流程"
            :remote-method="remoteMethod"
            :loading="loading"
            class="propwidth"
            @change="paramMsg(temp.processDefinitionId)"
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
import disabledState from '@/components/Dolphin/mixin/disabledState'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import {
  listByPage,
  save,
  update,
  del,
  findByprocessDef,
  startScheduleStatus,
  stopScheduleStatus,
  getParamsByProcessId,
  getByScheduleId,
  copy
} from '@/api/etlscheduler/processschedule'
import { getById } from '@/api/etlscheduler/processdefinition'
import QueryField from '@/components/Ace/query-field/index'
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
      // 开始时间大于今天  
      startTime: {
        disabledDate: time => {
          if (this.temp.endTime) {
            return (
              time.getTime() > new Date(this.temp.endTime).getTime()
            );
          } else {
            return time.getTime() < Date.now();
          }
        }
      },
      endTime: {
        disabledDate: time => {
          if (this.temp.startTime) {
            return (
              time.getTime() < Date.now() ||
              time.getTime() < new Date(this.temp.startTime).getTime()
            );
          } else {
            return time.getTime() < Date.now();
          }
        }
      },
      disableUpdate: false,
      closeStatus: false,
      // 启用停用
      startStatus: true,
      stopStatus: true,
      // 添加依赖
      relation: 'AND',
      dependTaskList: [],
      paramList: [],
      distinctParamList: [],
      isLoading: false,
      //  查询任务流程
      options: [],
      processParam: {
        pageNo: 1,
        pageSize: 100,
        condition: {
          keyword: null
        }
      },
      // 作业周期格式化
      crontabFormat: [
        {
          'code': '0 0 0 * * ? *',
          'msg': '每日'
        },
        {
          'code': '0 0 0 1 * ? *',
          'msg': '每月'
        },
        {
          'code': '0 0 0 1 1,4,7,10 ? *',
          'msg': '每季度'
        },
        {
          'code': '0 0 0 1 1,7 ? *',
          'msg': '每半年'
        },
        {
          'code': '0 0 0 1 1 ? *',
          'msg': '每年'
        }
      ],
      loading: false,
      tableKey: 'id',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        {
          label: '任务名称',
          name: 'scheduleName',
          type: 'text',
          value: ''
        },
        {
          label: '状态',
          name: 'status',
          type: 'select',
          data: [
            {
              name: '启用',
              value: '1'
            },
            {
              name: '停用',
              value: '0'
            }
          ],
          default: '0'
        },
        {
          label: '模糊查询',
          name: 'keyword',
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
        condition: null,
        pageNo: 1,
        pageSize: 10,
        sortBy: 'asc',
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
        id: null,
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
        update: '编辑调度任务',
        create: '添加调度任务',
        show: '查看调度任务详情'
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
        // status: [
        //   {
        //     required: true,
        //     message: '请选择参数状态',
        //     trigger: 'change'
        //   }
        // ],
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
    // 监听selections集合
    selections() {
      if (this.selections.length > 0) {
        this.startStatus = false
        this.stopStatus = false
        this.selections.forEach((r, i) => {
          if (r.status === 1) {
            this.startStatus = true
          } else if (r.status === 0) {
            this.stopStatus = true
          }
        })
      } else {
        this.startStatus = true
        this.stopStatus = true
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
    this.getList()
    this.remoteMethod()
    const o = this.backfillItem
    const dependentResult = $(`#${o.id}`).data('dependent-result') || {}
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
                `${v1.id}-${v1.depTasks}-${v1.cycle}-${v1.dateValue}`
              ] || defaultState)
        )
      )
    }
  },
  methods: {
    findSchedule(data) {
      this.closeStatus = true
      this.disableUpdate = true
      this.temp = Object.assign({}, data) // copy obj
      this.dialogStatus = 'show'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      var id = this.temp.id
      var processId = this.temp.processDefinitionId
      getByScheduleId(id).then((resp) => {
        // if (resp.data.dependTaskInfoList !== null) {
        this.dependTaskList = resp.data.dependTaskInfoList
        // } else {
        //   this.dependTaskList = [];
        // }
        // if (resp.data.taskParamsList !== null && resp.data.taskParamsList !== "") {
        this.paramList = resp.data.taskParamsList
        // } else {
        //   this.paramList = [];
        // }
      })
    },
    // 导出 excel 格式
    exportFile() {
      var id = this.temp.processDefinitionId
      // var ids = []
      // this.selections.forEach((r, i) => { ids.push(r.id)})
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
      })
      this.dialogFormVisible1 = false
    },
    // 复制对象
    copyData() {
      this.selections.forEach((r, i) => {
        var id = r.id
        copy(id).then(() => {
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
        this.dependTaskList.push({
          dependItemList: [],
          relation: 'AND'
        })
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
      // console.log('getDependTaskList',i)
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
    // 参数详情
    paramMsg(data) {
      var id = data
      getById(id).then((res) => {
        this.temp.processDefName = res.data.name
      })
      getParamsByProcessId(id).then((res) => {
        this.paramList = res.data 
          // 去重 
        const resmap = new Map();
        this.distinctParamList=this.paramList.filter((a) => !resmap.has(a.paramUuid) && resmap.set(a.paramUuid, 1))
      })
    },
    // 查询任务流程
    remoteMethod(query) {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.processParam.condition.keyword = query
        findByprocessDef(this.processParam).then((resp) => {
          this.options = resp.data.records
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].status == 0) {
              this.options.pop(i)
            }
          }
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
        id: null,
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
      this.disableUpdate = false;
      this.closeStatus = false;
      this.distinctParamList = [];
      this.dependTaskList = [];
      this._onDeleteAll();
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.taskParamsList = this.distinctParamList;
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
      })
    },
    handleUpdate() {
      this.disableUpdate = false
      this.closeStatus = false
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      var id = this.temp.id
      var processId = this.temp.processDefinitionId
      getByScheduleId(id).then((resp) => {
        // if (resp.data.dependTaskInfoList !== null) {
        this.dependTaskList = resp.data.dependTaskInfoList
        // } else {
        // this.dependTaskList = [];
        // }
        // if (resp.data.taskParamsList !== null && resp.data.taskParamsList !== "") {      
            this.paramList = resp.data.taskParamsList;
              //  去重
            const resmap = new Map()
            this.distinctParamList=this.paramList.filter((a) => !resmap.has(a.paramUuid) && resmap.set(a.paramUuid, 1))
        // } else {
        // this.paramList = [];
        // }
      })
    },
    updateData() {
      this.temp.dependTaskInfoList = this.dependTaskList;
      this.temp.taskParamsList = this.distinctParamList;
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            this.getList()
            const index = this.list.findIndex((v) => v.id === this.temp.id)
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
    },
    handleDelete() {
      var ids = []
      this.selections.forEach((r, i) => {
        ids.push(r.id)
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
        ids.push(r.id)
      })
      startScheduleStatus(ids.join(','), 1).then((res) => {
        // if (res.data.code == 1000) {
        //   this.getList();
        //   this.$notify({
        //     title: "失败",
        //     message: res.data.msg,
        //     type: "error",
        //     duration: 2000,
        //     position: "bottom-right",
        //   });
        // }
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
        ids.push(r.id)
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
        if (res.data.code == 2501) {
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
        if (date == r.code) {
          message = r.msg
        }
      })
      return onTime + '-' + stopTime + message
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
    border-left: 4px solid #eee;
    margin-left: -46px;
    padding-left: 42px;
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
</style>
