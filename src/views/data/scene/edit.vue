<template>
  <div class="app-container">

    <div class="detail-form">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        style="width: 700px; margin-left:50px;"
      >
        <el-form-item label="业务场景名称" prop="attrName">
          <el-input v-model="temp.attrName" />
        </el-form-item>
        <el-form-item label="初始化参数名称" prop="attrCode">
          <el-input v-model="temp.attrCode" />
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input v-model="temp.describe" type="textarea" />
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { listByPage, save, update, del } from '@/api/data/biz-attr'
import QueryField from '@/components/Ace/query-field/index'
import { parseTime, getDict } from '@/utils'

export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'bizAttrUuid',
      list: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '业务属性编码', name: 'attrCode', type: 'text', value: '' },
        { label: '业务属性名称', name: 'attrName', type: 'fuzzyText' },
        // {label: '性别', name:'sex', type: 'select',
        //   data: [{name: '男', value: '1'}, {name: '女', value: '0'}],
        //   default: '1'},
        { label: '创建时间', name: 'createTime', type: 'timePeriod' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        bizAttrUuid: undefined,
        attrName: '',
        attrCode: '',
        describe: ''
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑业务属性',
        create: '添加业务属性'
      },
      dialogPvVisible: false,
      rules: {
        attrName: [{ required: true, message: '请填写业务属性名称', trigger: 'change' }],
        attrCode: [{ required: true, message: '请填写业务属性编码', trigger: 'change' }],
        describe: [{ max: 100, message: '长度不得超过100', trigger: 'change' }]
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
        bizAttrUuid: undefined,
        attrName: '',
        attrCode: '',
        describe: ''
      }
    },
    handleCreate() {
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
            const index = this.list.findIndex(v => v.bizAttrUuid === this.temp.bizAttrUuid)
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
      this.selections.forEach((r, i) => { ids.push(r.bizAttrUuid) })
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
    }
  }
}
</script>
