<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <div>
      <el-button
        type="primary"
        size="mini"
        @click="handleCreate()"
      >添加</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="selections.length !== 1"
        @click="handleUpdate()"
      >修改</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleDelete()"
      >删除</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="startStatus"
        @click="handleUse()"
      >启用</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="stopStatus"
        @click="handleBear()"
      >禁用</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length != 1"
        @click="copyData()"
      >复制</el-button>
      <el-upload
        class="upload-demo"
        multiple
        action=""
        :headers="headers"
        :http-request="uploadFile"
        :limit="3"
        :show-file-list="false"
        style="display:inline-block;padding-left:10px"
      >
        <el-button size="mini" type="primary">导入</el-button>
      </el-upload>
    </div>
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
        width="150px"
        align="center"
        prop="scheduleName"
      />
      <el-table-column
        v-if="false"
        label="任务流程"
        width="100px"
        align="center"
        prop="processDefinitionId"
      />
      <el-table-column
        label="任务流程"
        width="250px"
        align="center"
        prop="processDefName"
      />
      <el-table-column
        label="作业周期"
        width="80px"
        align="center"
        prop="crontab"
        :formatter="formatCron"
      />
      <el-table-column
        label="参数"
        width="150px"
        align="center"
        prop="taskParams"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>参数名称:{{ paramName(scope.row.taskParams) }}</p>
            <p>参数值:{{ paramVal(scope.row.taskParams) }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.taskParams }}</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="依赖任务环节"
        align="center"
        prop="dependTaskInfo"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>依赖名称:{{ dependName(scope.row.dependTaskInfo) }}</p>
            <p>依赖环节:{{ dependVal(scope.row.dependTaskInfo) }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.dependTaskInfo }}</el-tag>
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
        width="150px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
      <!-- <el-table-column label="调度任务描述" prop="scheduleDesc" /> -->
      <el-table-column
        label="最新修改人"
        width="100px"
        align="center"
        prop="updateUserName"
      />
      <el-table-column
        label="修改时间"
        width="200px"
        align="center"
        prop="updateTime"
      />
      <!-- <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="small">添加依赖</el-button>
          <el-button type="primary" size="small">手动执行</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        style="width: 700px; margin-left: 50px"
      >
        <el-form-item label="任务名称" prop="scheduleName">
          <el-input v-model="temp.scheduleName" />
        </el-form-item>
        <el-form-item label="排序号" prop="processInstancePriority">
          <el-input v-model="temp.processInstancePriority" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="作业周期" prop="crontab">
          <el-select v-model="temp.crontab" placeholder="请选择作业周期">
            <el-option label="每日" value="0 0 0 * * ? *" />
            <el-option label="每月" value="0 0 0 1 * ? *" />
            <el-option label="每季度" value="0 0 0 1 1,4,7,10 ? *" />
            <el-option label="每半年" value="0 0 0 1 1,7 ? *" />
            <el-option label="每年" value="0 0 0 1 1 ? *" />
          </el-select>
        </el-form-item>
        <el-form-item label="流程描述" prop="scheduleDesc">
          <el-input v-model="temp.scheduleDesc" type="textarea" />
        </el-form-item>
        <el-form-item label="任务流程" prop="processDefinitionId">
          <!-- 查询任务流程 -->
          <el-select
            v-model="temp.processDefinitionId"
            :filterable="true"
            :remote="true"
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading"
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

        <!-- <el-table :data="paramList" style="width: 100%">
          <el-table-column label="参数名称" width="180">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.prop }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数编码" width="180">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>参数名称: {{ scope.row.prop }}</p>
                <p>参数编码: {{ scope.row.type }}</p>
                <div slot="reference" class="name-wrapper">
                  <el-tag size="medium">{{ scope.row.type }}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="参数赋值">
            <template slot-scope="scope">
              <input
                v-model="temp.taskParams"
                type="text"
                placeholder="为参数赋值"
                @change="makeParam"
              >
            </template>
          </el-table-column>
        </el-table> -->
        <!-- <form>
          参数名称:<input value=""/>
          参数赋值:<input placeholder="为参数赋值"/>
        </form> -->
        <el-form-item v-for="item in paramList" :key="item.value" :label="item.prop" :prop="item.prop">
          <!-- v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value" -->
          <el-input v-model="item.value" @change="defaultValue" />
        </el-form-item>
        <!-- 添加任务依赖 -->
        <el-form-item>
          <div class="dependence-model">
            <m-list-box>
              <div slot="text">添加依赖</div>
              <div slot="content">
                <div class="dep-opt">
                  <a
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
                    class="dep-relation"
                    @click="!isDetails && _setGlobalRelation()"
                  >
                    {{ relation === "AND" ? '且' : '或' }}
                  </span>
                  <div
                    v-for="(el, $index) in dependTaskList"
                    :key="$index"
                    class="dep-list"
                  >
                    <span
                      v-if="el.dependItemList.length"
                      class="dep-line-pie"
                      @click="!isDetails && _setRelation($index)"
                    >
                      {{ el.relation === "AND" ? '且' : '或' }}
                    </span>
                    <em
                      class="ans-icon-trash dep-delete"
                      data-toggle="tooltip"
                      data-container="body"
                      :class="_isDetails"
                      title="删除"
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
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
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
  updateStatus,
  getParamsByProcessId,
  getByScheduleId,
  copy
} from '@/api/etlscheduler/processschedule'
import {
  getById
} from '@/api/etlscheduler/processdefinition'
import QueryField from '@/components/Ace/query-field/index'

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
      // 启用停用
      startStatus: true,
      stopStatus: true,
      // 添加依赖
      relation: 'AND',
      dependTaskList: [],
      dependTaskList: [{
        'dependItemList': [
          {
            'projectId': 1,
            'definitionId': '',
            'depTasks': '',
            'cycle': '',
            'dateValue': '',
            'state': '',
            'depTasksList': [
              {
                'id': '',
                'name': ''
              }
            ],
            'dateValueList': [
              {
                'value': 'currentHour',
                'label': '当前小时'
              },
              {
                'value': 'last1Hour',
                'label': '前1小时'
              },
              {
                'value': 'last2Hours',
                'label': '前2小时'
              },
              {
                'value': 'last3Hours',
                'label': '前3小时'
              },
              {
                'value': 'last24Hours',
                'label': '前24小时'
              },
              {
                'value': 'thisMonth',
                'label': '本月'
              },
              {
                'value': 'lastMonth',
                'label': '上月'
              },
              {
                'value': 'lastMonthBegin',
                'label': '上月初'
              },
              {
                'value': 'lastMonthEnd',
                'label': '上月末'
              },
              {
                'value': 'thisWeek',
                'label': '本周'
              },
              {
                'value': 'lastWeek',
                'label': '上周'
              },
              {
                'value': 'lastMonday',
                'label': '上周一'
              },
              {
                'value': 'lastTuesday',
                'label': '上周二'
              },
              {
                'value': 'lastWednesday',
                'label': '上周三'
              },
              {
                'value': 'lastThursday',
                'label': '上周四'
              },
              {
                'value': 'lastFriday',
                'label': '上周五'
              },
              {
                'value': 'lastSaturday',
                'label': '上周六'
              },
              {
                'value': 'lastSunday',
                'label': '上周日'
              },
              {
                'value': 'today',
                'label': '今天'
              },
              {
                'value': 'last1Days',
                'label': '昨天'
              },
              {
                'value': 'last2Days',
                'label': '前两天'
              },
              {
                'value': 'last3Days',
                'label': '前三天'
              },
              {
                'value': 'last7Days',
                'label': '前七天'
              }
            ]
          }
        ],
        'relation': 'AND'
      }],
      paramList: [],
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
          type: 'fuzzyText',
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
          null: '启用'
        },
        crontab: {
          '0 0 0 * * ? *': '每日',
          '0 0 0 1 * ? *': '每月',
          '0 0 0 1 1,4,7,10 ? *': '每季度',
          '0 0 0 1 1,7 ? *': '每半年',
          '0 0 0 1 1 ? *': '每年'
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
        taskParams: null,
        dependTaskInfo: null,
        processInstancePriority: null,
        status: null,
        scheduleDesc: null,
        updateUserName: null,
        updateTime: null,
        crontab: null,
        scheduleName: null,
        processDefinitionId: null,
        id: null,
        processDefName: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑参数',
        create: '添加参数'
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
        processInstancePriority: [
          {
            required: true,
            message: '请填写排序号',
            trigger: 'change'
          }
        ],
        scheduleDesc: [
          {
            max: 100,
            message: '请填写流程描述',
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
        status: [
          {
            required: true,
            message: '请选择参数状态',
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
                `${v1.definitionId}-${v1.depTasks}-${v1.cycle}-${v1.dateValue}`
              ] || defaultState)
        )
      )
    }
  },
  methods: {
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
    paramName(v) {
      return v.substring(v.indexOf('{') + 1, v.indexOf(':'))
    },
    paramVal(v) {
      return v.substring(v.indexOf(':') + 1, v.indexOf('}'))
    },
    dependName(v) {
      if (v != null) {
        return v.substring(v.indexOf('name') + 7, v.lastIndexOf('}]') - 3)
      }
    },
    dependVal(v) {
      if (v != null) {
        return v.substring(v.indexOf('id') + 5, v.indexOf('name') - 3)
      }
    },
    defaultValue() {
      const prop = this.paramList[0].prop
      const value = this.paramList[0].value
      var s = '[{' + prop + ':' + value + '}]'
      this.temp.taskParams = s
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
      this.dependTaskList[i].relation =
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
    // 参数赋值
    // makeParam(e) {
    // const { value } = e.target
    // console.log(value)
    // console.log("输入框===="+JSON.stringify(this.paramList[0].prop) + ":" +JSON.stringify(value))
    // console.log("paramList"+this.paramList[0].prop)
    // },
    // 参数详情
    paramMsg() {
      var id = this.temp.processDefinitionId
      getById(id).then((resp) => {
        // console.log(resp.data.name)
        this.temp.processDefName = resp.data.name
      })
      getParamsByProcessId(id).then((resp) => {
        this.paramList = resp.data
        // this.paramList = [
        //   {prop: "333",
        //    value: "444"
        //   }]
      })
    },
    // 查询任务流程
    remoteMethod(query) {
      // if (query !== '') {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.processParam.condition.keyword = query
        // console.log(this.processParam.condition.keyword)
        findByprocessDef(this.processParam).then((resp) => {
          this.options = resp.data.records
        })
      }, 200)
      // } else {
      //   // this.options = []
      //     this.loading = false
      //     this.processParam.condition.keyword = query
      //     // console.log(this.processParam.condition.keyword)
      //     findByprocessDef(this.processParam).then((resp) => {
      //       this.options = resp.data.records
      //     })
      // }
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
        processDefName: null
      }
    },
    handleCreate() {
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
        if (valid) {
          this.temp.dependTaskInfo = '[{"definitionId"' + ':' + '"' + this.dependTaskList[0].dependItemList[0].definitionId + '"' + ',' +
          '"depTasks"' + ':' + '"' + this.dependTaskList[0].dependItemList[0].depTasks + '"' + ',' + '"cycle"' + ':' + '"' + this.dependTaskList[0].dependItemList[0].cycle + '"' + ',' +
          '"dateValue"' + ':' + '"' + this.dependTaskList[0].dependItemList[0].dateValue + '"' + ',' + '"depTasksList"' + ':' + '[{' + '"id"' + ':' + '"' + this.dependTaskList[0].dependItemList[0].depTasks + '"' + ',' +
          '"name"' + ':' + '"' + this.dependTaskList[0].dependItemList[0].depTasksList[0].name + '"' + '}]' + '}]'
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
      location.reload() // 页面刷新有点长 暂改
    },
    handleUpdate() {
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // console.log('selections:'+this.temp.processDefinitionId)
      var id = this.temp.id
      var processId = this.temp.processDefinitionId
      getByScheduleId(id).then((resp) => {
        var s = JSON.stringify(resp.data.taskParams)
        // console.log(JSON.parse(resp.data.dependTaskInfo)[0].definitionId)
        if (resp.data.dependTaskInfo == null || resp.data.dependTaskInfo == '') {
          this.dependTaskList[0].dependItemList[0].definitionId = null
          this.dependTaskList[0].dependItemList[0].depTasks = null
          this.dependTaskList[0].dependItemList[0].cycle = null
          this.dependTaskList[0].dependItemList[0].dateValue = null
          this.dependTaskList[0].dependItemList[0].depTasksList[0].id = null
          this.dependTaskList[0].dependItemList[0].depTasksList[0].name = null
        } else {
          this.dependTaskList[0].dependItemList[0].definitionId = JSON.parse(resp.data.dependTaskInfo)[0].definitionId
          this.dependTaskList[0].dependItemList[0].depTasks = JSON.parse(resp.data.dependTaskInfo)[0].depTasks
          this.dependTaskList[0].dependItemList[0].cycle = JSON.parse(resp.data.dependTaskInfo)[0].cycle
          this.dependTaskList[0].dependItemList[0].dateValue = JSON.parse(resp.data.dependTaskInfo)[0].dateValue
          this.dependTaskList[0].dependItemList[0].depTasksList[0].id = JSON.parse(resp.data.dependTaskInfo)[0].depTasks
          this.dependTaskList[0].dependItemList[0].depTasksList[0].name = JSON.parse(resp.data.dependTaskInfo)[0].depTasksList[0].name
        }
        getParamsByProcessId(processId).then((resp) => {
          this.paramList = resp.data
          this.paramList[0].value = s.substring(s.indexOf(':') + 1, s.indexOf('}'))
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
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
      this.selections.forEach((r, i) => { ids.push(r.id) })
      updateStatus(ids.join(','), 1).then(() => {
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
      this.selections.forEach((r, i) => { ids.push(r.id) })
      updateStatus(ids.join(','), 0).then(() => {
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
    // 格式化表格
    formatStatus(data) {
      return this.formatMap.status[data.status]
    },
    formatCron(data) {
      return this.formatMap.crontab[data.crontab]
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">
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
</style>
