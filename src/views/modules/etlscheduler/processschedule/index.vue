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
      <el-upload
        class="upload-demo"
        action="https://jsonplaceholder.typicode.com/posts/"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        multiple
        :limit="10"
        :on-exceed="handleExceed"
      >
        <el-button
          size="small"
          type="primary"
        >批量导入</el-button>
      </el-upload>
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
        :disabled="selections.length === 0"
        @click="handleUse()"
      >启用</el-button>
      <el-button
        type="danger"
        size="mini"
        :disabled="selections.length === 0"
        @click="handleBear()"
      >禁用</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="调度任务名称"
        width="300px"
        align="center"
        prop="scheduleName"
      />
      <el-table-column
        label="任务流程"
        width="300px"
        align="center"
        prop="processDefinitionId"
        :formatter="formatProcessDef"
      />
      <el-table-column
        label="作业周期"
        width="300px"
        align="center"
        prop="crontab"
      />
      <el-table-column
        label="参数"
        width="300px"
        align="center"
        prop="taskParams"
      />
      <el-table-column
        label="依赖任务环节"
        width="300px"
        align="center"
        prop="dependTaskInfo"
      />
      <el-table-column
        label="排序号"
        width="300px"
        align="center"
        prop="processInstancePriority"
      />
      <el-table-column
        label="状态"
        width="300px"
        align="center"
        prop="enableState"
        :formatter="formatStatus"
      />
      <el-table-column
        label="调度任务描述"
        prop="scheduleDesc"
      />
      <el-table-column
        label="最新修改人"
        width="300px"
        align="center"
        prop="updateUserName"
      />
      <el-table-column
        label="修改时间"
        width="300px"
        align="center"
        prop="updateTime"
      />
      <el-table-column
        label="操作"
        width="400"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
          >添加依赖</el-button>
          <el-button
            type="primary"
            size="small"
          >手动执行</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="140px"
        style="width: 700px; margin-left:50px;"
      >
        <el-form-item
          label="任务名称"
          prop="scheduleName"
        >
          <el-input v-model="temp.scheduleName" />
        </el-form-item>
        <el-form-item
          label="排序号"
          prop="processInstancePriority"
        >
          <el-input v-model="temp.processInstancePriority" />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="enableState"
        >
          <el-select
            v-model="temp.enableState"
            placeholder="请选择状态"
          >
            <el-option
              label="启用"
              :value="1"
            />
            <el-option
              label="停用"
              :value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="作业周期"
          prop="crontab"
        >
          <el-input v-model="temp.crontab" />
        </el-form-item>
        <el-form-item
          label="流程描述"
          prop="scheduleDesc"
        >
          <el-input
            v-model="temp.scheduleDesc"
            type="textarea"
          />
        </el-form-item>
        <el-form-item
          label="任务流程"
          prop="processDefinitionId"
        >

          <!-- 查询任务流程 -->
          <el-select
            v-model="value"
            multiple
            :filterable="true"
            :remote="true"
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading"
          >
            <el-option
              v-for="item in options"
              :key="item.processDefinitionUuid"
              :label="item.name"
              :value="item.processDefinitionUuid"
            />
          </el-select>

        </el-form-item>
        <el-table
          :data="paramData"
          style="width: 100%"
        >
          <el-table-column
            prop="paramName"
            label="参数名称"
          />
          <el-table-column
            prop="paramCode"
            label="参数编码"
          />
          <el-table-column label="参数赋值">
            <el-input />
          </el-table-column>
        </el-table>
        <el-form-item label="依赖任务">
          <el-button
            type="primary"
            size="mini"
          >新增</el-button>
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
                      :title="添加"
                    />
                    <em
                      v-if="isLoading"
                      class="ans-icon-spinner2 as as-spin"
                      data-toggle="tooltip"
                      :title="添加"
                    />
                  </a>
                </div>
                <div class="dep-box">
                  <span
                    v-if="dependTaskList.length"
                    class="dep-relation"
                    @click="!isDetails && _setGlobalRelation()"
                  >
                    {{ relation === 'AND' ? 且 : 或 }}
                  </span>
                  <div
                    v-for="(el,$index) in dependTaskList"
                    :key="$index"
                    class="dep-list"
                  >
                    <span
                      v-if="el.dependItemList.length"
                      class="dep-line-pie"
                      @click="!isDetails && _setRelation($index)"
                    >
                      {{ el.relation === 'AND' ? 且 : 或 }}
                    </span>
                    <em
                      class="ans-icon-trash dep-delete"
                      data-toggle="tooltip"
                      data-container="body"
                      :class="_isDetails"
                      :title="删除"
                      @click="!isDetails && _deleteDep($index)"
                    />
                    <m-depend-item-list
                      v-model="el.dependItemList"
                      :depend-task-list="dependTaskList"
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
          @click="dialogStatus==='create'?createData():updateData()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import _ from 'lodash'
// import mListBox from './_source/listBox'
// import mDependItemList from './_source/dependItemList'
// import disabledState from '@/components/Dolphin/mixin/disabledState'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import {
  listByPage,
  save,
  update,
  del,
  findByprocessDef,
  updateEnableState
} from '@/api/etlscheduler/processschedule'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: {
    Pagination,
    QueryField
  },
  data() {
    return {
      //  查询任务流程
      options: [],
      processParam: {
        pageNo: 1,
        pageSize: 100,
        condition: {
          keyword: null
        }
      },
      value: [],
      loading: false,
      paramData: [{
        paramName: '文件路径',
        paramCode: 'FILE_PATH'
      }, {
        paramName: 'ODS表名',
        paramCode: 'ODS_TABLE_NAME'
      }, {
        paramName: 'DW表名',
        paramCode: 'DW_TABLE_NAME'
      }],
      tableKey: 'id',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [{
        label: '任务名称',
        name: 'scheduleName',
        type: 'fuzzyText',
        value: ''
      },
      {
        label: '状态',
        name: 'enableState',
        type: 'select',
        data: [{
          name: '启用',
          value: '1'
        }, {
          name: '停用',
          value: '0'
        }],
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
        enableState: {
          1: '启用',
          0: '停用',
          null: '启用'
        },
        processDefinitionId: {
          1: '标准ETL流程',
          2: '跑批计算流程'
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
        enableState: null,
        scheduleDesc: null,
        updateUserName: null,
        updateTime: null,
        crontab: null,
        scheduleName: null,
        processDefinitionId: null,
        id: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑参数',
        create: '添加参数'
      },
      dialogPvVisible: false,
      rules: {
        scheduleName: [{
          required: true,
          message: '请填写调度任务名称',
          trigger: 'change'
        }],
        processInstancePriority: [{
          required: true,
          message: '请填写排序号',
          trigger: 'change'
        }],
        scheduleDesc: [{
          max: 100,
          message: '请填写流程描述',
          trigger: 'change'
        }],
        crontab: [{
          required: true,
          message: '请填写作业周期',
          trigger: 'change'
        }],
        enableState: [{
          required: true,
          message: '请选择参数状态',
          trigger: 'change'
        }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },

  methods: {
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
    // 查询任务流程
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.processParam.condition.keyword = query
          // console.log(this.processParam.condition.keyword)
          findByprocessDef(this.processParam).then(resp => {
            this.options = resp.data.records
          })
        }, 200)
      } else {
        this.options = []
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择10个文件，本次选择了 ${files.length}个文件,共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}?`)
    },
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
      const {
        prop,
        order
      } = data
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
        enableState: null,
        updateUserName: null,
        updateTime: null
      }
    },
    handleCreate() {
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
      this.temp = Object.assign({}, this.selections[0]) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
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
      updateEnableState(ids.join(',')).then(() => {
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
      updateEnableState(ids.join(',')).then(() => {
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
      return this.formatMap.enableState[data.enableState]
    },
    formatProcessDef(data) {
      return this.formatMap.processDefinitionId[data.processDefinitionId]
    }
  }
}
</script>
