<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <el-row>
      <el-col align="right">
        <!-- 新增 -->
        <el-button type="primary" class="oper-btn add" title="新增" @click="handleCreate()" />
        <!-- 修改 -->
        <el-button type="primary" class="oper-btn edit" title="修改" :disabled="selections.length !== 1" @click="handleUpdate()" />
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
      max-height="800"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
      />
      <el-table-column
        label="参数名称"
        width="150px"
        align="center"
        prop="paramName"
      />
      <el-table-column
        label="参数编码"
        width="150px"
        align="center"
        prop="paramCode"
      />
      <el-table-column
        label="参数类型"
        width="150px"
        align="center"
        prop="paramType"
        :formatter="formatType"
      />
      <el-table-column
        label="默认值"
        width="150px"
        align="center"
        prop="defaultValue"
      />
      <!--
      <el-table-column
        label="可选值"
        width="150px"
        align="center"
        prop="selectValue"
      />
      -->
      <!--
      <el-table-column
        label="排序号"
        width="120px"
        align="center"
        prop="orderNo"
      />
      -->
      <el-table-column
        label="状态"
        width="120px"
        align="center"
        prop="status"
        :formatter="formatStatus"
      />
      <el-table-column
        label="参数描述"
        prop="paramDesc"
      />
      <el-table-column
        label="修改时间"
        width="180px"
        align="center"
        prop="updateTime"
      />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getList"
    />
    <!-- 新增和编辑的弹框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="参数名称"
          prop="paramName"
        >
          <el-input
            v-model="temp.paramName"
            placeholder="请输入参数名称"
            class="propwidth"
          />
        </el-form-item>
        <el-form-item
          label="参数编码"
          prop="paramCode"
        >
          <el-input v-model="temp.paramCode" placeholder="请输入参数编码" class="propwidth" />
        </el-form-item>
        <el-form-item
          label="参数状态"
          prop="status"
        >
          <el-select
            v-model="temp.status"
            class="propwidth"
            placeholder="请选择参数状态"
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
          label="参数类型"
          prop="paramType"
        >
          <el-select
            v-model="temp.paramType"
            class="propwidth"
            placeholder="请选择参数类型"
          >
            <el-option
              label="文本"
              :value="1"
            />
            <el-option
              label="其它"
              :value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="默认值"
          prop="defaultValue"
        >
          <el-input v-model="temp.defaultValue" placeholder="请输入参数默认值" class="propwidth" />
        </el-form-item>
        <el-form-item
          label="可选值"
          prop="selectValue"
        >
          <el-input v-model="temp.selectValue" placeholder="请输入参数可选值" class="propwidth" />
        </el-form-item>
        <el-form-item
          label="参数描述"
          prop="paramDesc"
        >
          <el-input
            v-model="temp.paramDesc"
            placeholder="请输入参数描述"
            type="textarea"
            class="propwidth"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogFormVisible = false">返回</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del } from '@/api/etlscheduler/paramfield'
import QueryField from '@/components/Ace/query-field/index'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'paramUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '参数编码', name: 'paramCode', type: 'text', value: '' },
        { label: '参数名称', name: 'paramName', type: 'text', value: '' },
        { label: '模糊查询', name: 'keyword', type: 'fuzzyText' },
        {
          label: '参数状态', name: 'status', type: 'select',
          data: [{ name: '启用', value: '1' }, { name: '停用', value: '0' }],
          default: '1'
        }
      ],
      // 格式化参数列表
      formatMap: {
        paramType: {
          1: '文本',
          null: '其它'
        },
        status: {
          1: '启用',
          0: '停用',
          null: '启用'
        }
      },
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
        sortBy: 'desc',
        sortName: 'updateTime'
      },
      temp: {
        defaultValue: null,
        paramCode: null,
        paramDesc: null,
        paramName: null,
        paramType: null,
        paramUuid: null,
        selectValue: null,
        status: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑参数',
        create: '新增参数'
      },
      dialogPvVisible: false,
      // 新增的表单验证
      rules: {
        paramName: [{ required: true, message: '请填写参数名', trigger: 'change' }],
        paramDesc: [{ max: 100, message: '请填写参数的描述', trigger: 'change' }],
        paramCode: [{ required: true, message: '请填写参数的编码', trigger: 'change' }],
        paramType: [{ required: true, message: '请选择参数的类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择参数状态', trigger: 'change' }]
      },
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
    resetTemp() {
      this.temp = {
        defaultValue: null,
        paramCode: null,
        paramDesc: null,
        paramName: null,
        paramType: 1,
        paramUuid: null,
        selectValue: null,
        status: null
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
            const index = this.list.findIndex(v => v.paramUuid === this.temp.paramUuid)
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
      this.selections.forEach((r, i) => { ids.push(r.paramUuid) })
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
    // 格式化表格
    formatType(data) {
      return this.formatMap.paramType[data.paramType]
    },
    formatStatus(data) {
      return this.formatMap.status[data.status]
    }
  }
}
</script>
<style scoped>
  .propwidth{
    /* width: 400px; */
  }
  .el-select .el-input {
    /* width: 380px; */
}
</style>
